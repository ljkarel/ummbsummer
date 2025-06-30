from django.urls import path
from .views import StravaLoginView, StravaCallbackView, StravaWebhooksView

# urlpatterns = [
#     path('login/', StravaLoginView.as_view(), name='strava_login'),
#     path('callback/', StravaCallbackView.as_view(), name='strava_callback'),
    
# ]

urlpatterns = [
    # path('', StravaStatusView.as_view(), name='strava_status'),
    path('login/', StravaLoginView.as_view(), name='strava_login'),
    path('callback/', StravaCallbackView.as_view(), name='strava_callback'),
    path('webhooks/<str:token>/', StravaWebhooksView.as_view(), name='strava_webhooks'),
]
