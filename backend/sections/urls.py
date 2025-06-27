from django.urls import path
from .views import AllSectionScores, SingleSectionScores

urlpatterns = [
    path('scores', AllSectionScores.as_view(), name='all_section_scores'),
    path('<str:section_name>/scores', SingleSectionScores.as_view(), name='single_section_scores'),
]