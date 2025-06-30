import os
from datetime import datetime, timezone

from urllib.parse import urlencode
from django.urls import reverse
from django.shortcuts import redirect

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .api import valid_scope, token_exchange
from members.models import StravaAuth

from django.conf import settings

WEBHOOK_ENDPOINT_TOKEN = os.getenv('STRAVA_WEBHOOK_ENDPOINT_TOKEN')
WEBHOOK_VERIFY_TOKEN = os.getenv('STRAVA_WEBHOOK_VERIFY_TOKEN')
WEBHOOK_SUBSCRIPTION_ID = os.getenv('STRAVA_WEBHOOK_SUBSCRIPTION_ID')

# The Strava app's client ID
CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')

OAUTH_URL = f'https://www.strava.com/oauth/authorize'


FRONTEND_REDIRECT = f'{settings.BASE_FRONTEND_URL}?registration_complete=true'

class StravaLoginView(APIView):
    def get(self, request):
        params = {
            'client_id': CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': request.build_absolute_uri(reverse('strava_callback')),
            'scope': 'activity:read,activity:read_all',
            'approval_prompt': 'auto'
        }

        return redirect(f'{OAUTH_URL}?{urlencode(params)}')
        

class StravaCallbackView(APIView):
    def get(self, request):
        print(request.user)

        code = request.GET.get('code')
        scope = request.GET.get('scope')
        error = request.GET.get('error')

        if error or not code or not scope:
            return redirect('strava_login')
        
        if not valid_scope(scope):
            return redirect('strava_login')
        
        token_data = token_exchange(code)

        member = request.user.member

        strava_auth, _ = StravaAuth.objects.update_or_create(
            strava_id=token_data['athlete']['id'],
            defaults={
                'member': member,
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expires': datetime.fromtimestamp(
                    token_data.get('expires_at'), tz=timezone.utc),
                'scope': scope,
            }
        )

        member.strava_auth = strava_auth
        member.save()

        return redirect(FRONTEND_REDIRECT)



@method_decorator(csrf_exempt, name='dispatch')
class StravaWebhooksView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, token):
        if token != WEBHOOK_VERIFY_TOKEN:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        mode = request.GET.get('hub.mode')
        challenge = request.GET.get('hub.challenge')
        verify_token = request.GET.get('hub.verify_token')

        if mode != 'subscribe' or not challenge:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        if verify_token != WEBHOOK_VERIFY_TOKEN:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        return Response({"hub.challenge": challenge}, status=status.HTTP_200_OK)
    
    def post(self, request, token):
        if token != WEBHOOK_VERIFY_TOKEN:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        
        


        return Response(status=status.HTTP_200_OK)


        
