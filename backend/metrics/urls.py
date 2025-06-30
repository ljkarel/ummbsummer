from django.urls import path
from .views import MemberWeeklyPointsView, SectionWeeklyScoreView, WeeklyScoreboardView

urlpatterns = [
    path('me/', MemberWeeklyPointsView.as_view(), name='member_weekly_points'),
    path('sections/<slug:section_slug>/', SectionWeeklyScoreView.as_view(), name='section_weekly_score'),
    path('scoreboard/', WeeklyScoreboardView.as_view(), name='scoreboard'),
]