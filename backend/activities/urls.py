from django.urls import path

from .views import ActivityMapView, MemberActivitiesView

urlpatterns = [
    path('', MemberActivitiesView.as_view(), name='member_activities'),
    path('<int:pk>/map/', ActivityMapView.as_view(), name='activity_map')
]
