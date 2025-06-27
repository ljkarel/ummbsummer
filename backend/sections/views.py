from django.shortcuts import render

# Create your views here.


from rest_framework.views import APIView

class AllSectionScores(APIView):
    def get(self, request):
        pass