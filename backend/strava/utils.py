import calendar
import os

import requests
from dateutil.parser import parse

from activities.models import Activity
from members.models import Member
from django.db.models import Max, Min

from metrics.models import Competition

# The Strava app's client ID
CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')

# The Strava app's client secret
CLIENT_SECRET = os.getenv('STRAVA_CLIENT_SECRET')

# The Strava club ID
CLUB_ID = int(os.getenv('STRAVA_CLUB_ID'))

# Base Strava API URL
BASE_URL = 'https://www.strava.com/api/v3'

# URL endpoint for Strava token exchange
TOKEN_URL = f'{BASE_URL}/oauth/token'

# URL endpoint for Strava deauthorization
DEAUTH_URL = f'{BASE_URL}/oauth/deauthorize'

ATHLETE_URL = f'{BASE_URL}/athlete'
ACTIVITIES_URL = f'{ATHLETE_URL}/activities'
CLUBS_URL = f'{ATHLETE_URL}/clubs'


def meters_to_miles(meters: float) -> float:
    """Converts meters to miles."""
    return round(meters / 1609.34, 2)


def meters_to_feet(meters: float) -> int:
    """Converts meters to feet."""
    return round(meters * 3.28084)


def seconds_to_minutes(seconds: int) -> int:
    """Converts seconds to minutes. Rounds down."""
    return seconds // 60


def valid_scope(scope: str) -> bool:
    """Determines whether a valid scope was given by the member."""
    return 'activity:read_all' in scope or 'activity:read' in scope


def get_strava_headers(member: Member) -> dict:
    """Returns the authorization header for a Strava API request."""
    access_token = member.strava_auth.get_valid_access_token()
    return {'Authorization': f'Bearer {access_token}'}


def token_exchange(auth_code: str):
    """Makes a request to Strava for an access token."""
    response = requests.post(TOKEN_URL, data={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': auth_code,
        'grant_type': 'authorization_code'
    }, timeout=10)
    return response.json()


# Make a request to Strava to deauthorize account with given access token
def deauthorize(access_token: str):
    requests.post(DEAUTH_URL, data={
        'access_token': access_token
    }, timeout=10)


def member_in_club(member: Member) -> bool:
    """Checks if the given member belongs to the Strava club."""

    headers = get_strava_headers(member)
    current_page = 1

    while True:
        params = {
            'page': current_page,
            'per_page': 200,
        }

        response = requests.get(CLUBS_URL, headers=headers, params=params, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Strava API error: {response.status_code} - {response.text}")

        clubs = response.json()

        if not clubs:
            return False

        if any(club.get('id') == CLUB_ID for club in clubs):
            return True

        current_page += 1


def get_profile_picture(member: Member):
    """Fetches the profile picture URL of a Strava member, if available."""
    headers = get_strava_headers(member)

    response = requests.get(ATHLETE_URL, headers=headers, timeout=10)
    if response.status_code != 200:
        raise Exception(f"Strava API error: {response.status_code} - {response.text}")

    data = response.json()
    return data.get('profile')


def update_all_member_activities():
    members = Member.objects.filter(strava_auth__isnull=False)

    for member in members:
        try:
            print(f"Updating activities for {member}...")
            update_member_activities(member)
        except Exception as e:
            print(f"Error updating {member}: {e}")


def update_member_activities(member: Member):
    headers = get_strava_headers(member)

    date_range = Competition.objects.aggregate(
        earliest=Min('start_date'),
        latest=Max('end_date'),
    )
    after = calendar.timegm(date_range['earliest'].timetuple()) if date_range['earliest'] else None
    before = calendar.timegm(date_range['latest'].timetuple()) if date_range['latest'] else None

    current_page = 1
    page_size = 200
    fetched_activity_ids = set()

    while True:
        params = {
            'page': current_page,
            'per_page': page_size,
            'after': after,
            'before': before,
        }

        response = requests.get(ACTIVITIES_URL, headers=headers, params=params, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Strava API error: {response.status_code} - {response.text}")

        activities = response.json()

        for activity in activities:
            activity_id = activity['id']
            fetched_activity_ids.add(activity_id)

            activity_data = {
                'member': member,
                'name': activity['name'],
                'distance': meters_to_miles(activity['distance']),
                'minutes': seconds_to_minutes(activity['moving_time']),
                'elapsed_time': seconds_to_minutes(activity['elapsed_time']),
                'elevation_gain': meters_to_feet(activity['total_elevation_gain']),
                'sport_type': activity['sport_type'],
                'datetime': parse(activity['start_date']),
                'polyline': activity.get('map', {}).get('summary_polyline'),
                'manual': activity['manual'],
                'private': activity['private']
            }

            Activity.objects.update_or_create(
                activity_id=activity_id,
                defaults=activity_data
            )

        if len(activities) != page_size:
            break

        current_page += 1

    Activity.objects.filter(member=member).exclude(activity_id__in=fetched_activity_ids).delete()


WEBHOOK_ENDPOINT_TOKEN = os.getenv('STRAVA_WEBHOOK_ENDPOINT_TOKEN')
WEBHOOK_VERIFY_TOKEN = os.getenv('STRAVA_WEBHOOK_VERIFY_TOKEN')
WEBHOOK_SUBSCRIPTION_ID = os.getenv('STRAVA_WEBHOOK_SUBSCRIPTION_ID')

STRAVA_SUBSCRIPTION_URL = 'https://www.strava.com/api/v3/push_subscriptions'


def create_strava_push_subscription():
    payload = {
        'client_id': os.getenv('STRAVA_CLIENT_ID'),
        'client_secret': os.getenv('STRAVA_CLIENT_SECRET'),
        'callback_url': f'https://5d972e479cdc.ngrok-free.app/api/strava/webhooks/{os.getenv('STRAVA_WEBHOOK_ENDPOINT_TOKEN')}/',
        'verify_token': os.getenv('STRAVA_WEBHOOK_VERIFY_TOKEN'),
    }

    response = requests.post(STRAVA_SUBSCRIPTION_URL, data=payload, timeout=10)
    # print(response)

    if response.status_code == 201:
        print("✅ Subscription created successfully:")
        print(response.json())
    else:
        print(f"❌ Failed to create subscription: {response.status_code}")
        print(response.text)


def list_strava_push_subscription():
    response = requests.get(
        STRAVA_SUBSCRIPTION_URL,
        params={
            'client_id': os.getenv('STRAVA_CLIENT_ID'),
            'client_secret': os.getenv('STRAVA_CLIENT_SECRET'),
        },
        timeout=10
    )

    if response.status_code == 200:
        subscriptions = response.json()
        if not subscriptions:
            print("ℹ️ No active Strava webhook subscriptions found.")
        else:
            print("✅ Active Strava webhook subscriptions:")
            for sub in subscriptions:
                print(f"- ID: {sub['id']}, Callback URL: {sub['callback_url']}")
        return subscriptions
    else:
        print(f"❌ Failed to list subscriptions: {response.status_code}")
        print(response.text)
        return []


def delete_strava_subscription(subscription_id: int):
    """Deletes a Strava webhook subscription by ID."""
    response = requests.delete(
        f"{STRAVA_SUBSCRIPTION_URL}/{subscription_id}",
        params={
            "client_id": os.getenv("STRAVA_CLIENT_ID"),
            "client_secret": os.getenv("STRAVA_CLIENT_SECRET"),
        },
        timeout=10
    )

    if response.status_code == 204:
        print(f"✅ Successfully deleted subscription {subscription_id}")
    else:
        print(f"❌ Failed to delete subscription {subscription_id}: {response.status_code}")
        print(response.text)
