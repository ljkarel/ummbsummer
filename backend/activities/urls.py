from django.urls import path

from .views import ActivityMapView, ActivitySVGView, MemberActivitiesView, MemberSportTypesView

urlpatterns = [
    path('', MemberActivitiesView.as_view(), name='member_activities'),
    path('sports/', MemberSportTypesView.as_view(), name='member_sport_types'),
    path('<int:pk>/map/', ActivityMapView.as_view(), name='activity_map'),
    path('<int:pk>/svg/', ActivitySVGView.as_view(), name='activity_svg'),
]
