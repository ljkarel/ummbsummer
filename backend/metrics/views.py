from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from members.models import Section

from .models import CompetitionPeriod, SectionPeriodScore
from .serializers import LiveSectionScoreSerializer, SectionPeriodScoreSerializer
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


class ScoreboardView(APIView):
    """
    Returns scores for all sections for a given period, sorted by score descending.
    Uses frozen SectionPeriodScore if available; falls back to live computation for
    the current period.
    """

    def get(self, request):
        period_id = request.query_params.get('period')
        if period_id:
            period = get_object_or_404(CompetitionPeriod, pk=period_id)
        else:
            period = get_current_period()
            if period is None:
                return Response({'detail': 'No active competition period.'}, status=404)

        frozen = SectionPeriodScore.objects.filter(period=period).exists()

        if frozen:
            scores = list(
                SectionPeriodScore.objects.filter(period=period).select_related('section', 'period')
            )
            scores.sort(key=lambda s: s.score, reverse=True)
            serializer = SectionPeriodScoreSerializer(scores, many=True)
        else:
            sections = Section.objects.all()
            live_scores = [compute_section_score_for_period(s, period) for s in sections]
            live_scores.sort(key=lambda s: s['score'], reverse=True)
            serializer = LiveSectionScoreSerializer(live_scores, many=True)

        return Response(serializer.data)
