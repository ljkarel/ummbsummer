from django.urls import path
from .views import UserActivities

urlpatterns = [
    path('', UserActivities.as_view(), name='user_activities')
]