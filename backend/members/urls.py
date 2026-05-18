from django.urls import path

from .views import MemberMeView, RosterView, SectionRegistrationView

urlpatterns = [
    path('', SectionRegistrationView.as_view(), name='section_registration'),
    path('me/', MemberMeView.as_view(), name='member_me'),
    path('roster/', RosterView.as_view(), name='roster'),
]
