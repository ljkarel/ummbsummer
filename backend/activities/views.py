from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from .models import Activity
from .serializers import ActivitySerializer


class TenPerPagePagination(PageNumberPagination):
    page_size = 10


class MemberActivitiesView(ListAPIView):
    serializer_class = ActivitySerializer
    pagination_class = TenPerPagePagination

    def get_queryset(self):
        qs = Activity.objects.filter(member=self.request.user.member).select_related('period')

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
