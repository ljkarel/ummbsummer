from django.urls import path
from .views import GoogleAuthInit, GoogleAuthCallback, LogOut, Me

urlpatterns = [
    path('', GoogleAuthInit.as_view(), name='google_auth_init'),
    path('callback/', GoogleAuthCallback.as_view(), name='google_auth_callback'),
    path('logout/', LogOut.as_view(), name='google_auth_logout'),
    path('me/', Me.as_view(), name='google_auth_me')
]
