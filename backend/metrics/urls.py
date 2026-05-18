from django.urls import path

from .views import MemberPeriodPointsView, PeriodListView, PublicStatsView, ScoreboardView, SectionPeriodScoreView

urlpatterns = [
    path('me/', MemberPeriodPointsView.as_view(), name='member_period_points'),
    path('sections/<slug:section_slug>/', SectionPeriodScoreView.as_view(), name='section_period_score'),
    path('scoreboard/', ScoreboardView.as_view(), name='scoreboard'),
    path('periods/', PeriodListView.as_view(), name='period_list'),
    path('public/', PublicStatsView.as_view(), name='public_stats'),
]
