from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from activities.models import Activity
from members.models import Member, Section
from members.utils import get_active_competition

from .models import CompetitionPeriod, SectionPeriodScore
from .serializers import (
    LiveSectionScoreSerializer,
    PeriodSerializer,
    ScoreboardSectionSerializer,
    SectionPeriodScoreSerializer,
)
from .utils import (
    compute_member_points_for_period,
    compute_section_score_for_period,
    get_current_period,
)


class MemberPeriodPointsView(APIView):
    """Returns the requesting member's computed points for a given period (or current period)."""

    def get(self, request):
        period_id = request.query_params.get('period')
        if period_id:
            period = get_object_or_404(CompetitionPeriod, pk=period_id)
        else:
            period = get_current_period()
            if period is None:
                return Response({'detail': 'No active competition period.'}, status=404)

        member = request.user.member
        points = compute_member_points_for_period(member, period)
        return Response({'period': period.name, 'points': points})


class SectionPeriodScoreView(APIView):
    """Returns frozen SectionPeriodScore records for a section, optionally filtered by period."""

    def get(self, request, section_slug):
        period_id = request.query_params.get('period')
        section = get_object_or_404(Section, slug=section_slug)

        scores_qs = SectionPeriodScore.objects.filter(section=section).select_related('section', 'period')
        if period_id:
            scores_qs = scores_qs.filter(period_id=period_id)

        serializer = SectionPeriodScoreSerializer(scores_qs.order_by('period__start_date'), many=True)
        return Response(serializer.data)


class PeriodListView(APIView):
    """GET /api/metrics/periods/ — all periods for the active competition."""

    def get(self, request):
        competition = get_active_competition()
        if competition is None:
            return Response([])

        member = request.user.member
        periods = competition.periods.order_by('start_date')
        result = []
        live_found = False
        for period in periods:
            # At most one period can be live at a time. During the window between
            # a period's start_date (UTC midnight) and its predecessor's freeze
            # time, both periods would naively compute as 'live'. Clamp the second
            # one back to 'future' so the frontend always sees exactly one live period.
            state = period.state
            if state == 'live':
                if live_found:
                    state = 'future'
                else:
                    live_found = True

            you = None
            if state != 'future':
                you = round(compute_member_points_for_period(member, period), 2)
            result.append({
                'id': period.pk,
                'name': period.name,
                'state': state,
                'start_date': period.start_date,
                'end_date': period.end_date,
                'freeze_datetime': period.freeze_datetime,
                'you': you,
            })

        return Response(PeriodSerializer(result, many=True).data)


class ScoreboardView(APIView):
    """
    GET /api/metrics/scoreboard/ — section leaderboard with per-period history and rank trend.
    """

    def get(self, request):
        competition = get_active_competition()
        if competition is None:
            return Response([])

        member = request.user.member
        periods = list(competition.periods.order_by('start_date'))
        sections = list(Section.objects.all())

        # Build score per section per period: {section.pk: [score_or_null, ...]}
        period_scores: dict[int, list[float | None]] = {s.pk: [] for s in sections}

        for period in periods:
            if period.state == 'future':
                for s in sections:
                    period_scores[s.pk].append(None)
                continue

            frozen_qs = SectionPeriodScore.objects.filter(period=period).select_related('section')
            frozen_map = {fs.section_id: fs.score for fs in frozen_qs}

            for s in sections:
                if s.pk in frozen_map:
                    period_scores[s.pk].append(frozen_map[s.pk])
                else:
                    live = compute_section_score_for_period(s, period)
                    period_scores[s.pk].append(live['score'])

        # Compute season totals and rank trend
        def season_total(section):
            return round(sum(v for v in period_scores[section.pk] if v is not None), 2)

        # Rank sections for the two most recent non-future periods
        non_future_indices = [i for i, p in enumerate(periods) if p.state != 'future']

        def get_ranks_at(period_index):
            scored = [(s, period_scores[s.pk][period_index]) for s in sections if period_scores[s.pk][period_index] is not None]
            scored.sort(key=lambda x: x[1], reverse=True)
            return {s.pk: rank + 1 for rank, (s, _) in enumerate(scored)}

        trend_map: dict[int, int | None] = {s.pk: None for s in sections}
        if len(non_future_indices) >= 2:
            prev_ranks = get_ranks_at(non_future_indices[-2])
            curr_ranks = get_ranks_at(non_future_indices[-1])
            for s in sections:
                if s.pk in prev_ranks and s.pk in curr_ranks:
                    # Positive trend = moved up (lower rank number)
                    trend_map[s.pk] = prev_ranks[s.pk] - curr_ranks[s.pk]

        result = []
        for s in sections:
            result.append({
                'name': s.name,
                'slug': s.slug,
                'members': s.members.count(),
                'periods': period_scores[s.pk],
                'season': season_total(s),
                'trend': trend_map[s.pk],
                'is_me': s.pk == member.section_id,
            })

        result.sort(key=lambda x: x['season'], reverse=True)
        return Response(ScoreboardSectionSerializer(result, many=True).data)


class PublicStatsView(APIView):
    """GET /api/metrics/public/ — unauthenticated competition overview for the sign-in page."""

    permission_classes = [AllowAny]

    def get(self, request):
        competition = get_active_competition()
        if competition is None:
            return Response({})

        periods = list(competition.periods.order_by('start_date'))
        live_period_n = None
        live_found = False
        for i, p in enumerate(periods):
            state = p.state
            if state == 'live':
                if not live_found:
                    live_period_n = i + 1
                    live_found = True

        total_minutes = Activity.objects.aggregate(t=Sum('minutes'))['t'] or 0
        member_count = Member.objects.count()
        section_count = Section.objects.count()

        return Response({
            'start_date': competition.start_date,
            'end_date': competition.end_date,
            'total_periods': len(periods),
            'live_period_n': live_period_n,
            'total_minutes': total_minutes,
            'member_count': member_count,
            'section_count': section_count,
        })
