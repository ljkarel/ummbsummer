import os
import requests
from datetime import datetime, timezone
from dateutil.parser import parse

from members.models import Member, StravaAuth
from activities.models import Activity
from activities.serializers import ActivitySerializer
from django.db import transaction


# The Strava app's client ID
CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')

# The Strava app's client secret
CLIENT_SECRET = os.getenv('STRAVA_CLIENT_SECRET')

# The epoch time of the start date for pulling activities
START_DATE = os.getenv('START_DATE_EPOCH_TIME')

# The epoch time of the end date for pulling activities
END_DATE = os.getenv('END_DATE_EPOCH_TIME')

# Base Strava API URL
BASE_URL = 'https://www.strava.com/api/v3'

# URL endpoint for Strava token exchange
TOKEN_URL = f'{BASE_URL}/oauth/token'

# URL endpoint for Strava deauthorization
DEAUTH_URL = f'{BASE_URL}/oauth/deauthorize'

# URL endpoint for Strava activity GET requests
ACTIVITIES_URL = f'{BASE_URL}/athlete/activities'


def meters_to_miles(meters):
    """Converts meters to miles."""
    return round(meters / 1609.34, 2)

def meters_to_feet(meters):
    """Converts meters to feet."""
    return round(meters * 3.28084)

def seconds_to_minutes(seconds):
    """Converts seconds to minutes. Rounds down."""
    return int(seconds / 60)

def valid_scope(scope):
    """Determines whether a valid scope was given by the member."""
    return 'activity:read_all' in scope or 'activity:read' in scope

# Make a request to Strava for an access token
def token_exchange(auth_code):
    response = requests.post(TOKEN_URL, data={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': auth_code,
        'grant_type': 'authorization_code'
    })
    return response.json()

# Make a request to Strava to deauthorize account with given access token
def deauthorize(access_token):
    requests.post(DEAUTH_URL, data={
        'access_token': access_token
    })


def update_all_member_activities():
    members = Member.objects.filter(strava_auth__isnull=False)

    for member in members:
        try:
            print(f"Updating activities for {member}...")
            update_member_activities(member)
        except Exception as e:
            print(f"Error updating {member}: {e}")


def update_member_activities(member: Member):
    access_token = member.strava_auth.get_valid_access_token()
    headers = {'Authorization': f'Bearer {access_token}'}

    current_page = 1
    page_size = 200
    fetched_activity_ids = set()

    while True:
        params = {
            'page': current_page,
            'per_page': page_size,
            'after': START_DATE,
            'before': END_DATE
        }

        response = requests.get(ACTIVITIES_URL, headers=headers, params=params)
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
