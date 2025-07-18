from django.urls import path
from .views import GoogleAuthInitView, GoogleAuthCallbackView, GoogleAuthLogoutView, GoogleAuthStatusView


urlpatterns = [
    path('', GoogleAuthStatusView.as_view(), name='auth_status'),
    path('init/', GoogleAuthInitView.as_view(), name='auth_init'),
    path('callback/', GoogleAuthCallbackView.as_view(), name='auth_callback'),
    path('logout/', GoogleAuthLogoutView.as_view(), name='auth_logout'),
]
