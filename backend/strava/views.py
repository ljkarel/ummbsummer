import hashlib
import hmac
import logging
import os
import time
from datetime import UTC, datetime, timezone
from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from members.models import StravaAuth

from .tasks import process_strava_webhook, sync_member_activities
from .utils import get_profile_picture, member_in_club, token_exchange, valid_scope

WEBHOOK_VERIFY_TOKEN = os.getenv('STRAVA_WEBHOOK_VERIFY_TOKEN')
WEBHOOK_SUBSCRIPTION_ID = os.getenv('STRAVA_WEBHOOK_SUBSCRIPTION_ID')

# The Strava app's client ID
CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')
CLIENT_SECRET = os.getenv('STRAVA_CLIENT_SECRET')

OAUTH_URL = 'https://www.strava.com/oauth/authorize'

logger = logging.getLogger(__name__)


class StravaStatusView(APIView):
    """
    Returns the Strava registration status and related info for the currently authenticated user.

    ### Permitted methods:
    - GET: Returns whether the user is registered with Strava and includes related metadata if applicable.
    """

    def get(self, request):
        user = request.user

        # Try to get the Strava auth associated with the user, if any
        member = getattr(user, 'member', None)

        # If a member exists, check if they have connected their Strava account
        strava_auth = getattr(member, 'strava_auth', None) if member else None

        if strava_auth:
            # Member is registered, return Strava info
            return Response({
                'registered': True,
                'strava_id': strava_auth.strava_id,
                'scope': strava_auth.scope,
                'in_club': member_in_club(member),
                'profile_picture': get_profile_picture(member)
            })

        if not member and not (user.is_staff or user.is_superuser):
            # No member exists and user is not admin, raise error
            raise NotFound("Member not found.")

        # Member is not registered or user is admin with no member
        return Response({'joined': False})


class StravaInitView(APIView):
    """
    View that initializes the Strava OAuth 2.0 flow.

    ### Permitted methods:
    - GET: Redirects the user to the Strava OAuth 2.0 endpoint.
    """

    def get(self, request):
        params = {
            'client_id': CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': request.build_absolute_uri(reverse('strava_callback')),
            'scope': 'activity:read,activity:read_all',
        }

        return redirect(f'{OAUTH_URL}?{urlencode(params)}')


class StravaCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')
        scope = request.GET.get('scope')
        error = request.GET.get('error')

        if error:
            return redirect(f'{settings.FRONTEND_URL}/?strava_cancelled=true')

        if not code or not scope:
            return redirect(f'{settings.FRONTEND_URL}/onboarding')

        if not valid_scope(scope):
            return redirect(f'{settings.FRONTEND_URL}/onboarding?strava_scope_error=true')

        token_data = token_exchange(code)

        member = request.user.member

        StravaAuth.objects.update_or_create(
            strava_id=token_data['athlete']['id'],
            defaults={
                'member': member,
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'token_expires': datetime.fromtimestamp(
                    token_data.get('expires_at'), tz=UTC),
                'scope': scope,
            }
        )

        sync_member_activities.delay(member.id)

        return redirect(f'{settings.FRONTEND_URL}/onboarding/profile')


def _verify_strava_signature(request) -> bool:
    sig_header = request.headers.get('X-Strava-Signature', '')
    try:
        parts = dict(item.split('=', 1) for item in sig_header.split(','))
        timestamp = parts['t']
        v1 = parts['v1']
    except (KeyError, ValueError):
        return False

    if abs(time.time() - int(timestamp)) > 300:
        return False

    signed_payload = f"{timestamp}.{request.body.decode()}"
    expected = hmac.new(CLIENT_SECRET.encode(), signed_payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, v1)


@method_decorator(csrf_exempt, name='dispatch')
class StravaWebhooksView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        mode = request.GET.get('hub.mode')
        challenge = request.GET.get('hub.challenge')
        verify_token = request.GET.get('hub.verify_token')

        if mode != 'subscribe' or not challenge:
            raise ValidationError("Missing or invalid mode/challenge.")

        if verify_token != WEBHOOK_VERIFY_TOKEN:
            raise PermissionDenied("Invalid verification token.")

        return Response({"hub.challenge": challenge})

    def post(self, request):
        logger.warning("Received Strava webhook request")
        logger.warning("Headers: %s", dict(request.headers))
        if not _verify_strava_signature(request):
            raise PermissionDenied("Invalid signature.")
        logger.warning("Received Strava webhook: %s", request)

        if request.data['subscription_id'] != int(WEBHOOK_SUBSCRIPTION_ID):
            raise PermissionDenied("Invalid subscription ID.")

        process_strava_webhook.delay(request.data)
        return Response()
