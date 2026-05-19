from django.urls import path

from .views import ActivityHeatmapView, ActivityMapView, ActivitySVGView, MemberActivitiesView, MemberSportTypesView

urlpatterns = [
    path('', MemberActivitiesView.as_view(), name='member_activities'),
    path('sports/', MemberSportTypesView.as_view(), name='member_sport_types'),
    path('heatmap/', ActivityHeatmapView.as_view(), name='activity_heatmap'),
    path('<int:pk>/map/', ActivityMapView.as_view(), name='activity_map'),
    path('<int:pk>/svg/', ActivitySVGView.as_view(), name='activity_svg'),
]
