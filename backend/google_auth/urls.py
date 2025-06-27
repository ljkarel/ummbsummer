from django.urls import path
from .views import GoogleAuthInit, GoogleAuthCallback, LogOut, Me

urlpatterns = [
    path('', Me.as_view(), name='auth_status'),
    path('login/', GoogleAuthInit.as_view(), name='auth_login'),
    path('callback/', GoogleAuthCallback.as_view(), name='auth_callback'),
    path('logout/', LogOut.as_view(), name='auth_logout'),
]
