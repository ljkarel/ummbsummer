from django.urls import path
from .views import GoogleAuthLoginView, GoogleAuthCallbackView, GoogleAuthLogoutView, GoogleAuthStatusView

urlpatterns = [
    path('', GoogleAuthStatusView.as_view(), name='auth_status'),
    path('login/', GoogleAuthLoginView.as_view(), name='auth_login'),
    path('callback/', GoogleAuthCallbackView.as_view(), name='auth_callback'),
    path('logout/', GoogleAuthLogoutView.as_view(), name='auth_logout'),
]
