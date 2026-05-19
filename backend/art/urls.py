from django.urls import path

from .views import (
    ArtLikeToggleView,
    ArtOpenSubmissionCreateView,
    ArtOpenWallView,
    ArtSubmissionDetailView,
    ArtSubmissionView,
    ArtWallView,
    MyArtOpenSubmissionsView,
    MyArtSubmissionView,
)

urlpatterns = [
    path('wall/', ArtWallView.as_view()),
    path('open-wall/', ArtOpenWallView.as_view()),
    path('submissions/', ArtSubmissionView.as_view()),
    path('submissions/me/', MyArtSubmissionView.as_view()),
    path('submissions/<int:pk>/', ArtSubmissionDetailView.as_view()),
    path('submissions/<int:pk>/like/', ArtLikeToggleView.as_view()),
    path('open-submissions/me/', MyArtOpenSubmissionsView.as_view()),
    path('open-submissions/', ArtOpenSubmissionCreateView.as_view()),
]
