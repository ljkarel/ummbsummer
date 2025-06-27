import os
import requests
from datetime import datetime, timezone

from django.utils.timezone import now

from members.models import Member, StravaAuth
from activities.models import Activity
from activities.serializers import ActivitySerializer

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
    return round(meters / 1609.34, 2)

def meters_to_feet(meters):
    return round(meters * 3.28084)

def seconds_to_minutes(seconds):
    return int(seconds / 60)

def valid_scope(scope):
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

def epoch_to_datetime(epoch_time):
    return datetime.fromtimestamp(epoch_time, tz=timezone.utc)



def update_strava_auth(strava_auth: StravaAuth, token_data):
    """Updates Strava auth info with provided token data response JSON."""
    strava_auth.access_token = token_data.get('access_token')
    strava_auth.refresh_token = token_data.get('refresh_token')
    strava_auth.token_expires = epoch_to_datetime(token_data.get('expires_at'))
    strava_auth.save()


def refresh_access_token(member: Member):
    """Ensures that the member's access token is valid, refreshing it if needed."""

    # Get the Strava auth info for the given member
    strava_auth = member.strava_auth

    # Check if the member's access token is expired; if not, return it
    if not strava_auth.token_expired:
        return
    
    # Otherwise, obtain a new access token and update the member's auth info
    response = requests.post(TOKEN_URL, data={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': strava_auth.refresh_token
    })
    token_data = response.json()
    update_strava_auth(strava_auth, token_data)

    return

def update_member_activities(member: Member):
    refresh_access_token(member)

    access_token = member.strava_auth.access_token
    headers = {'Authorization': f'Bearer {access_token}'}

    current_page = 1
    page_size = 200

    while True:
        params = {
            'page': current_page,
            'per_page': page_size,
            'after': START_DATE,
            'before': END_DATE
        }

        response = requests.get(ACTIVITIES_URL, headers=headers, params=params)

        activities = response.json()

        for activity in activities:
            activity_id = activity['id']
            activity_data = {
                'member': member.pk,
                'name': activity['name'],
                'distance': meters_to_miles(activity['distance']),
                'minutes': seconds_to_minutes(activity['moving_time']),
                'elapsed_time': seconds_to_minutes(activity['elapsed_time']),
                'elevation_gain': meters_to_feet(activity['total_elevation_gain']),
                'type': activity['sport_type'],
                'datetime': activity['start_date'],
                'polyline': activity.get('map', {}).get('summary_polyline'),
                'manual': activity['manual'],
                'private': activity['private']
            }
            try:
                existing_activity = Activity.objects.get(pk=activity_id)
                serializer = ActivitySerializer(existing_activity, data=activity_data, partial=True)
            except Activity.DoesNotExist:
                serializer = ActivitySerializer(data={**activity_data, 'activity_id': activity_id})

            if serializer.is_valid():
                serializer.save()

        if len(activities) != page_size:
            break
        
        current_page += 1
            


# def update_member_activities(member: Member):
