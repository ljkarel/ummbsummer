from zoneinfo import ZoneInfo

from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from .models import Activity
from .serializers import ActivitySerializer


class TwelvePerPagePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 500


class MemberActivitiesView(ListAPIView):
    serializer_class = ActivitySerializer
    pagination_class = TwelvePerPagePagination

    def get_queryset(self):
        qs = Activity.objects.filter(member=self.request.user.member).select_related('period').order_by('-datetime')

        sport = self.request.query_params.get('sport')
        if sport:
            # Match against the display value (e.g. "Run", "Ride")
            qs = qs.filter(sport_type__iexact=sport)

        period_id = self.request.query_params.get('period_id')
        if period_id:
            qs = qs.filter(period_id=period_id)

        week = self.request.query_params.get('week')
        if week:
            qs = qs.filter(period__name__iexact=week)

        return qs


class MemberSportTypesView(APIView):
    def get(self, request):
        values = (
            Activity.objects.filter(member=request.user.member)
            .values_list('sport_type', flat=True)
            .distinct()
            .order_by('sport_type')
        )
        choices = dict(Activity._meta.get_field('sport_type').choices)
        sports = [{'value': v, 'label': choices.get(v, v)} for v in values]
        return JsonResponse({'sports': sports})


class ActivityHeatmapView(APIView):
    def get(self, request):
        chicago = ZoneInfo('America/Chicago')
        activities = (
            Activity.objects
            .filter(member=request.user.member)
            .exclude(period=None)
            .select_related('period')
            .values('datetime', 'minutes', 'period__name')
        )
        heatmap = {}
        for a in activities:
            period_name = a['period__name']
            try:
                week_idx = int(period_name.replace('Period ', '').replace('Week ', '')) - 1
            except (ValueError, AttributeError):
                continue
            if week_idx < 0 or week_idx > 7:
                continue
            day_idx = a['datetime'].astimezone(chicago).weekday()  # Mon=0, Sun=6
            key = f'{week_idx}-{day_idx}'
            heatmap[key] = heatmap.get(key, 0) + a['minutes']
        return JsonResponse({'heatmap': heatmap})


class ActivityMapView(APIView):
    def get(self, request, pk):
        activity = get_object_or_404(Activity, pk=pk)

        if activity.member.user != request.user:
            if not request.user.has_perm('activities.view_activity'):
                raise PermissionDenied("You do not have access to this map.")

        if not activity.map_image:
            raise NotFound("No map available for this activity.")

        return FileResponse(activity.map_image.open(), content_type='image/png')


class ActivitySVGView(APIView):
    """GET /api/activities/<pk>/svg/ — returns the SVG path for the activity's route."""

    def get(self, request, pk):
        activity = get_object_or_404(Activity, pk=pk)

        if activity.member.user != request.user:
            raise PermissionDenied("You do not have access to this activity.")

        return JsonResponse({'svgPath': activity.svg_path or ''})
