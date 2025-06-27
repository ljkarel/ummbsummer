from django.urls import path
from .views import StravaAuthInit, StravaAuthCallback, StravaWebhooks

urlpatterns = [
    path('login/', StravaAuthInit.as_view(), name='strava_login'),
    path('callback/', StravaAuthCallback.as_view(), name='strava_callback'),
    path('webhooks/<str:token>/', StravaWebhooks.as_view(), name='webhooks'),
]