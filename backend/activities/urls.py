from django.urls import path
from .views import MemberActivitiesView

urlpatterns = [
    path('', MemberActivitiesView.as_view(), name='member_activities')
]