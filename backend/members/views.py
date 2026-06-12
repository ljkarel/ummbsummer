from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from metrics.utils import compute_member_points_for_period, get_current_period

from .models import Member, Section
from .serializers import MemberMeSerializer, RosterMemberSerializer, SectionNameSerializer, SectionSerializer
from .utils import compute_member_streak, get_active_competition, notify_admins


class SectionListView(ListAPIView):
    """Public endpoint returning section names for the roster request form."""
    authentication_classes = []
    permission_classes = []
    queryset = Section.objects.all().order_by('name')
    serializer_class = SectionNameSerializer


UMN_EMAIL_SUFFIX = '@umn.edu'
YEAR_LABELS = {1: 'Rookie', 2: '2nd Year', 3: '3rd Year', 4: '4th Year', 5: '5th Year+'}


class SubmitRosterRequestView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip()
        section = request.data.get('section', '').strip()
        year = request.data.get('year')
        notes = request.data.get('notes', '').strip()

        errors = {}
        if not first_name:
            errors['first_name'] = 'Required.'
        if not last_name:
            errors['last_name'] = 'Required.'
        if not email.lower().endswith(UMN_EMAIL_SUFFIX):
            errors['email'] = 'Must be a @umn.edu email address.'
        if not section:
            errors['section'] = 'Required.'
        if not year:
            errors['year'] = 'Required.'
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        year_label = YEAR_LABELS.get(int(year), str(year))
        body = (
            f"Name: {first_name} {last_name}\n"
            f"Email: {email}\n"
            f"Section: {section}\n"
            f"Year: {year_label}\n"
            f"Notes: {notes or '—'}"
        )

        try:
            notify_admins(f'[Roster Request] {first_name} {last_name}', body)
        except Exception:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_204_NO_CONTENT)


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
            ).values_list('minutes', flat=True)
            total_minutes = sum(total_minutes)
            total_points = round(sum(compute_member_points_for_period(member, p) for p in periods), 2)

        data = {
            'name': member.display_name,
            'section': member.section.name if member.section else None,
            'week_minutes': week_minutes,
            'week_points': week_points,
            'total_minutes': total_minutes,
            'total_points': total_points,
            'streak': compute_member_streak(member),
            'strava_connected': hasattr(member, 'strava_auth'),
            'strava_scope': member.strava_auth.scope if hasattr(member, 'strava_auth') else None,
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
        qs = Member.objects.filter(is_independent=False).select_related(
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


FEEDBACK_CATEGORIES = {'Bug', 'Feature Request', 'Question', 'Other'}


class SubmitFeedbackView(APIView):
    def post(self, request):
        category = request.data.get('category', '').strip()
        description = request.data.get('description', '').strip()
        reporter_email = request.data.get('reporterEmail', '').strip()

        if not category or category not in FEEDBACK_CATEGORIES:
            return Response({'error': 'Invalid category.'}, status=status.HTTP_400_BAD_REQUEST)
        if not description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)

        member_name = getattr(getattr(request.user, 'member', None), 'display_name', request.user.email)

        body = (
            f"Category: {category}\n"
            f"From: {member_name} <{reporter_email or request.user.email}>\n\n"
            f"{description}"
        )

        try:
            notify_admins(f'[Feedback] {category}', body)
        except Exception:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_204_NO_CONTENT)
