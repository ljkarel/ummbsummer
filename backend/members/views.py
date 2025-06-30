from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Section
from .serializers import SectionSerializer

class SectionRegistrationView(APIView):
    def get(self, request):
        sections = Section.objects.prefetch_related('members__strava_auth').all()
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)
