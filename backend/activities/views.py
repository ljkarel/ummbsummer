from rest_framework.generics import ListAPIView

from .models import Activity
from .serializers import ActivitySerializer

class MemberActivitiesView(ListAPIView):
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(member=self.request.user.member)