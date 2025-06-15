import os
from datetime import datetime, timezone

from django.shortcuts import redirect
from django.contrib.auth import login, logout
from django.contrib.auth.models import User

from rest_framework.views import APIView

from strava.api import valid_scope, token_exchange, deauthorize
from .models import Member, Section

from .serializers import SectionWithMembersSerializer

from rest_framework.response import Response

class MemberList(APIView):
    def get(self, request):
        sections = Section.objects.all()
        serializer = SectionWithMembersSerializer(sections, many=True, context={'request': request})
        return Response(serializer.data)



# LOGIN_PAGE_URL = os.getenv('LOGIN_PAGE_URL')
# HOME_PAGE_URL = os.getenv('HOME_PAGE_URL')


# class LogInMember(APIView):
#     authentication_classes = []  # Allow unauthenticated users
#     permission_classes = []      # No permission checks

#     def get(self, request):
#         code = request.GET.get('code')
#         scope = request.GET.get('scope')
#         error = request.GET.get('error')

#         # Ensure member did not cancel and that necessary parameters are present
#         if error or not code or not scope:
#             # TODO: Encode error information in query parameters
#             return redirect(LOGIN_PAGE_URL)

#         # Ensure member provided the needed scope to view activity data
#         if not valid_scope(scope):
#             # TODO: Encode error information in query parameters
#             return redirect(LOGIN_PAGE_URL)
        
#         token_data = token_exchange(code)
#         athlete_summary = token_data.get('athlete')
#         strava_id = athlete_summary.get('id')

#         # Match with existing member
#         try:
#             member = Member.objects.get(strava_auth_id=strava_id)
#         except Member.DoesNotExist:
#             # If member doesn't exist, deauthorize the athelete
#             access_token = token_data.get('access_token')
#             deauthorize(access_token)

#             # TODO: Encode error information in query parameters
#             return redirect(LOGIN_PAGE_URL)

#         # Get or create user for member 
#         if member.user is None:
#             username = f'member_{strava_id}'
#             user, _ = User.objects.get_or_create(username=username)
#             member.user = user
#             member.save()
#         else:
#             user = member.user

#         # Save token info
#         member.access_token = token_data.get('access_token')
#         member.refresh_token = token_data.get('refresh_token')
#         member.token_expires = datetime.fromtimestamp(
#             token_data.get('expires_at'), tz=timezone.utc)
#         member.save()

#         # TODO: Pull all member activities


#         # Log the member in
#         login(request, user)

#         return redirect(HOME_PAGE_URL)
    

# class LogOutMember(APIView):
#     def get(self, request):
#         logout(request)
#         return redirect(LOGIN_PAGE_URL)