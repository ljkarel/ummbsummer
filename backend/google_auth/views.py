from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from members.models import Member

CLIENT_CONFIG = {
    'web': {
        'client_id': settings.GOOGLE_AUTH['CLIENT_ID'],
        'client_secret': settings.GOOGLE_AUTH['CLIENT_SECRET'],
        'redirect_uris': [settings.GOOGLE_AUTH['REDIRECT_URI']],
        'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
        'token_uri': 'https://oauth2.googleapis.com/token'
    }
}


def build_flow(state=None):
    """Creates a Google OAuth 2.0 flow object with the specified state."""
    return Flow.from_client_config(
        client_config=CLIENT_CONFIG,
        scopes=settings.GOOGLE_AUTH['SCOPES'],
        redirect_uri=settings.GOOGLE_AUTH['REDIRECT_URI'],
        state=state
    )


def redirect_to_login(error=None):
    """Redirects to the frontend login page. Allows specification of an error."""
    error_param = f'?error={error}' if error else ''
    return redirect(f'{settings.BASE_FRONTEND_URL}/login{error_param}')


class GoogleAuthStatusView(APIView):
    """
    View that returns basic identity information for the currently authenticated user.

    ### Permitted methods:
    - GET: Used to check authorization. Returns the user's display name.
    """

    def get(self, request):
        user = request.user

        # Try to get the member associated with the user, if any
        member = getattr(user, 'member', None)

        if member:
            # Member exists
            return Response({'display_name': member.display_name})

        if user.is_staff or user.is_superuser:
            # Member doesn't exist, but user is admin
            return Response({'display_name': 'Staff User'})

        # No member exists and user is not admin, raise error
        raise NotFound("Member not found.")


class GoogleAuthInitView(APIView):
    """
    View that initializes the Google OAuth 2.0 flow.

    ### Permitted methods:
    - GET: Redirects the user to the Google OAuth 2.0 endpoint.
    """

    # Users (necessarily) do not need to be logged in to access this view
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # If in development mode, bypass Google authorization and just log in as the admin account
        if settings.DEBUG:
            user = User.objects.get(username='admin')
            login(request, user)
            return redirect(settings.BASE_FRONTEND_URL)

        # Create an OAuth 2.0 flow using the client configuration and desired scopes
        flow = build_flow()

        # Check if the request has a bypass_hd parameter to allow login from any Google account
        bypass_hd = request.GET.get('bypass_hd', '').lower() == 'true'

        auth_url_kwargs = {
            'include_granted_scopes': 'true',
            'hd': settings.GOOGLE_AUTH['HD'] if not bypass_hd else None  # Restrict login to users in specified Google domain (e.g. 'umn.edu')
        }

        # Generate the Google authorization URL and session state token
        auth_url, state = flow.authorization_url(**auth_url_kwargs)

        # Store the state token in the session to validate the response later
        request.session['google_auth_state'] = state

        # Redirect the user to the Google authorization page
        return redirect(auth_url)


class GoogleAuthCallbackView(APIView):
    """
    View that serves as the callback URI in the Google OAuth 2.0 flow.

    ### Permitted methods:
    - GET: Validates the authorization details, logs the user in (if valid), and redirects to the appropriate page.
    """

    # Users (necessarily) do not need to be logged in to access this view
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        # Retrieve the state token from the session to verify this is a valid response from Google
        state = request.session.pop('google_auth_state', None)
        if not state:
            return redirect_to_login('missing_state')

        # Reconstruct the OAuth flow using the original state and the same redirect URI
        flow = build_flow(state)

        # Extract the authorization code from the callback request parameters
        code = request.GET.get('code')
        if not code:
            return redirect_to_login('missing_code')

        # Exchange the authorization code for access and ID tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Parse and verify the ID token
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            request=Request(),
            audience=settings.GOOGLE_AUTH['CLIENT_ID'],
            clock_skew_in_seconds=10
        )

        # Extract identity info from the verified token
        email = id_info.get('email')
        verified = id_info.get('email_verified', False)
        google_id = id_info.get('sub')  # The user's unique Google ID

        # If the email wasn't verified by Google, reject the login
        if not verified:
            return redirect_to_login('email_not_verified')

        try:
            # First try to find a member with this email
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            # If not found, check if this is a staff/superuser account
            try:
                user = User.objects.get(email=email)
                if user.is_staff or user.is_superuser:
                    login(request, user)
                    return redirect(settings.BASE_FRONTEND_URL)
                else:
                    return redirect_to_login('non_admin_user')
            except User.DoesNotExist:
                return redirect_to_login('nonexistant_member')

        # Find the user associated with the member
        user = member.user
        if not user:
            # If the user doesn't exist, create it using the unique Google ID
            member.user, _ = User.objects.get_or_create(username=f'member_{google_id}')
            member.save()

        # Log the member's user in
        login(request, user)

        # If the member hasn't connected with Strava yet, send them to the registration page
        if not hasattr(member, 'strava_auth'):
            return redirect(f'{settings.BASE_FRONTEND_URL}/registration')

        # Otherwise, redirect them to the home page
        return redirect(settings.BASE_FRONTEND_URL)


class GoogleAuthLogoutView(APIView):
    """
    Logs the user out of the Django session and redirects to the frontend's logout landing page.

    ### Permitted methods:
    - POST: Performs logout and redirects to the frontend.
    """
    def post(self, request):
        logout(request)
        return redirect_to_login()
