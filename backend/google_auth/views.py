import os
from google.auth.transport.requests import Request

from rest_framework.views import APIView
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from django.shortcuts import redirect
from django.contrib.auth import login, logout
from django.contrib.auth.models import User

from rest_framework import status

from rest_framework.response import Response

from members.models import Member

# Create your views here.

CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

AUTH_URI = 'https://accounts.google.com/o/oauth2/auth'
TOKEN_URI = 'https://oauth2.googleapis.com/token'
REDIRECT_URI = 'https://2a54-67-218-23-206.ngrok-free.app/api/auth/google/callback/'
HD = 'umn.edu'

CLIENT_CONFIG = {
    'web': {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uris': [REDIRECT_URI],
        'auth_uri': AUTH_URI,
        'token_uri': TOKEN_URI
    }
}
SCOPES = ['openid', 'https://www.googleapis.com/auth/userinfo.email']

# HOME_PAGE_URL = os.getenv('HOME_PAGE_URL')
HOME_PAGE_URL = 'http://localhost:5173'

class GoogleAuthInit(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # TODO: Remove this
        print("auth init")
        return redirect('google_auth_callback')

        print(request.user)
        flow = Flow.from_client_config(
            client_config=CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        auth_url, state = flow.authorization_url(
            include_granted_scopes='true',
            hd=HD
        )
        request.session['google_auth_state'] = state
        return redirect(auth_url)

class GoogleAuthCallback(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # state = request.session.get('google_auth_state')
        # if not state:
        #     return redirect('google_auth_init')

        # flow = Flow.from_client_config(
        #     client_config=CLIENT_CONFIG,
        #     scopes=SCOPES,
        #     state=state,
        #     redirect_uri=REDIRECT_URI
        # )

        # code = request.GET.get('code')
        # if not code:
        #     return redirect('google_auth_init')

        # # Get the code from the query parameters and fetches the token
        # flow.fetch_token(code=code)

        # credentials = flow.credentials

        # # Parse and verify the ID token
        # id_info = id_token.verify_oauth2_token(
        #     credentials.id_token,
        #     request=Request(),
        #     audience=CLIENT_ID,
        #     clock_skew_in_seconds=10
        # )

        # email = id_info.get('email')
        # verified = id_info.get('email_verified', False)
        # sub = id_info.get('sub')
        
        # if not verified:
        #     return redirect('google_auth_init')

        # TODO: Remove this
        email = 'karel084@umn.edu'
        sub = 1000
        print("auth callback")
        
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return redirect('google_auth_init')

        if member.user is None:
            username = f'member_{sub}'
            user, _ = User.objects.get_or_create(username=username)
            member.user = user
            member.save()
        else:
            user = member.user
        
        print("Logging user in...")
        login(request, user)

        return redirect(HOME_PAGE_URL)

class LogOut(APIView):
    def get(self, request):
        print("Logging user out...")
        logout(request)
        return redirect('http://localhost:5173/end')
    
class Me(APIView):
    def get(self, request):
        user = request.user
        
        try:
            member = user.member
        except Member.DoesNotExist:
            return Response({'detail': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'first_name': member.first_name,
            'last_name': member.last_name,
            'strava_authenticated': member.strava_auth is not None,
        })