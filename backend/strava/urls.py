from django.urls import path

from .views import (
    StravaCallbackView,
    StravaInitView,
    StravaStatusView,
    StravaWebhooksView,
)

urlpatterns = [
    path('', StravaStatusView.as_view(), name='strava_status'),
    path('init/', StravaInitView.as_view(), name='strava_init'),
    path('callback/', StravaCallbackView.as_view(), name='strava_callback'),
    path('webhooks/<str:token>/', StravaWebhooksView.as_view(), name='strava_webhooks'),
]
