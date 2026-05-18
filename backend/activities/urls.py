from django.urls import path

from .views import ActivityMapView, ActivitySVGView, MemberActivitiesView

urlpatterns = [
    path('', MemberActivitiesView.as_view(), name='member_activities'),
    path('<int:pk>/map/', ActivityMapView.as_view(), name='activity_map'),
    path('<int:pk>/svg/', ActivitySVGView.as_view(), name='activity_svg'),
]
