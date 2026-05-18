from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from metrics.utils import compute_member_points_for_period, get_current_period

from .models import Member, RosterRequest, Section
from .serializers import MemberMeSerializer, RosterMemberSerializer, RosterRequestSerializer, SectionNameSerializer, SectionSerializer
from .utils import compute_member_streak, get_active_competition


class SectionListView(ListAPIView):
    """Public endpoint returning section names for the roster request form."""
    authentication_classes = []
    permission_classes = []
    queryset = Section.objects.all().order_by('name')
    serializer_class = SectionNameSerializer


class RosterRequestCreateView(CreateAPIView):
    """Public endpoint for submitting a roster access request."""
    authentication_classes = []
    permission_classes = []
    serializer_class = RosterRequestSerializer


class SectionRegistrationView(APIView):
    def get(self, request):
        sections = Section.objects.prefetch_related('members__strava_auth').all()
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)


class MemberMeView(APIView):
    def get(self, request):
        member = request.user.member
        competition = get_active_competition()
        current_period = get_current_period()

        week_minutes = 0
        week_points = 0.0
        if current_period:
            activities_this_period = member.activities.filter(
                datetime__date__gte=current_period.start_date,
                datetime__date__lte=current_period.end_date,
                private=False,
            )
            week_minutes = sum(a.minutes for a in activities_this_period)
            week_points = round(compute_member_points_for_period(member, current_period), 2)

        total_minutes = 0
        total_points = 0.0
        if competition:
            periods = competition.periods.all()
            total_minutes = member.activities.filter(
                datetime__date__gte=competition.start_date,
                datetime__date__lte=competition.end_date,
                private=False,
            ).values_list('minutes', flat=True)
            total_minutes = sum(total_minutes)
            total_points = round(sum(compute_member_points_for_period(member, p) for p in periods), 2)

        data = {
            'name': member.display_name,
            'section': member.section.name,
            'week_minutes': week_minutes,
            'week_points': week_points,
            'total_minutes': total_minutes,
            'total_points': total_points,
            'streak': compute_member_streak(member),
            'strava_connected': hasattr(member, 'strava_auth'),
            'nickname': getattr(member.preferences, 'nickname', None),
            'preferred_email': getattr(member.preferences, 'preferred_email', None),
            'roster_email': member.email,
        }
        return Response(MemberMeSerializer(data).data)

    def patch(self, request):
        member = request.user.member
        prefs = member.preferences

        if 'nickname' in request.data:
            prefs.nickname = request.data['nickname'] or None
        if 'preferredEmail' in request.data:
            prefs.preferred_email = request.data['preferredEmail'] or None
        prefs.save()

        return Response({'status': 'updated'})


class RosterView(APIView):
    def get(self, request):
        qs = Member.objects.select_related(
            'section', 'preferences', 'user'
        ).prefetch_related('strava_auth').order_by('section__name', 'last_name', 'first_name')

        section_slug = request.query_params.get('section')
        if section_slug:
            qs = qs.filter(section__slug=section_slug)

        status_filter = request.query_params.get('status')
        if status_filter == 'connected':
            qs = qs.filter(strava_auth__isnull=False)
        elif status_filter == 'pending':
            qs = qs.filter(user__isnull=False, strava_auth__isnull=True)
        elif status_filter == 'unregistered':
            qs = qs.filter(user__isnull=True)

        serializer = RosterMemberSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)
