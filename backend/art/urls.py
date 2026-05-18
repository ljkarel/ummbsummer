from django.urls import path

from .views import (
    ArtLikeToggleView,
    ArtSubmissionDetailView,
    ArtSubmissionView,
    ArtWallView,
    MyArtSubmissionView,
)

urlpatterns = [
    path('wall/', ArtWallView.as_view()),
    path('submissions/', ArtSubmissionView.as_view()),
    path('submissions/me/', MyArtSubmissionView.as_view()),
    path('submissions/<int:pk>/', ArtSubmissionDetailView.as_view()),
    path('submissions/<int:pk>/like/', ArtLikeToggleView.as_view()),
]
