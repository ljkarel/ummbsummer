from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Activity
from .serializers import ActivitySerializer

class UserActivities(APIView):
    def get(self, request):
        activities = Activity.objects.filter(member=request.user.member)
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)