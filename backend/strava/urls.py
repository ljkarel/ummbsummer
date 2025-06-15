from django.urls import path
from .views import StravaAuthInit, StravaAuthCallback, StravaWebhooks

urlpatterns = [
    path('', StravaAuthInit.as_view(), name='strava_auth_init'),
    path('callback/', StravaAuthCallback.as_view(), name='strava_auth_callback'),
    path('webhooks/<str:token>/', StravaWebhooks.as_view(), name='webhooks'),
]