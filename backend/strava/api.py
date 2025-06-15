import os
import requests
from datetime import datetime, timedelta, timezone

from django.utils.timezone import now

from members.models import Member, StravaAuth

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


def valid_scope(scope):
    return 'activity:read_all' in scope or 'activity_read' in scope

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

def token_expired(token_expiration_datetime):
    return token_expiration_datetime < now() + timedelta(seconds=60)


def update_strava_auth(strava_auth: StravaAuth, token_data):
    strava_auth.access_token = token_data.get('access_token')
    strava_auth.refresh_token = token_data.get('refresh_token')
    strava_auth.token_expires = epoch_to_datetime(token_data.get('expires_at'))



def refresh_access_token(member: Member):
    strava_auth = member.strava_auth

    if not token_expired(strava_auth.token_expires):
        return strava_auth.access_token
    
    response = requests.post(TOKEN_URL, data={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': strava_auth.refresh_token
    })

    token_data = response.json()
    strava_auth.access_token = token_data.get('access_token')
    strava_auth.refresh_token = token_data.get('refresh_token')
    strava_auth.token_expires = token_data.get('token_expires')


# def update_member_activities(member: Member):
