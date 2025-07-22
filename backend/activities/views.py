from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import Activity
from .serializers import ActivitySerializer
from django.http import FileResponse
from django.shortcuts import get_object_or_404


class TenPerPagePagination(PageNumberPagination):
    page_size = 10


class MemberActivitiesView(ListAPIView):
    serializer_class = ActivitySerializer
    pagination_class = TenPerPagePagination

    def get_queryset(self):
        return Activity.objects.filter(member=self.request.user.member)


class ActivityMapView(APIView):
    def get(self, request, pk):
        activity = get_object_or_404(Activity, pk=pk)
    
        if activity.member.user != request.user:
            if not request.user.has_perm('activities.view_activity'):
                raise PermissionDenied("You do not have access to this map.")
        
        if not activity.map_image:
            raise NotFound("No map available for this activity.")
        
        return FileResponse(activity.map_image.open(), content_type='image/png')
        