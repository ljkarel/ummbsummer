from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from members.models import Section

from .models import SectionWeeklyScore
from .serializers import MemberWeeklyPointsSerializer, SectionWeeklyScoreSerializer


class MemberWeeklyPointsView(APIView):
    def get(self, request):
        week = request.query_params.get('week')
        member = request.user.member

        points_qs = member.weekly_points.all()
        if week:
            points_qs = points_qs.filter(week=week)

        serializer = MemberWeeklyPointsSerializer(points_qs.order_by('week'), many=True)
        return Response(serializer.data)


class SectionWeeklyScoreView(APIView):
    def get(self, request, section_slug):
        week = request.query_params.get('week')
        section = get_object_or_404(Section, slug=section_slug)

        scores_qs = section.weekly_scores.all()
        if week:
            scores_qs = scores_qs.filter(week=week)

        serializer = SectionWeeklyScoreSerializer(scores_qs.order_by('week'), many=True)
        return Response(serializer.data)


class WeeklyScoreboardView(APIView):
    def get(self, request):
        week = request.query_params.get('week')
        scores_qs = SectionWeeklyScore.objects.select_related('section')

        if week:
            scores_qs = scores_qs.filter(week=week)

        scores = list(scores_qs)  # Evaluate queryset
        scores.sort(key=lambda s: s.score, reverse=True)  # Sort by property in Python

        serializer = SectionWeeklyScoreSerializer(scores, many=True)
        return Response(serializer.data)
