from django.urls import path

from .views import MemberMeView, RosterRequestCreateView, RosterView, SectionListView, SectionRegistrationView

urlpatterns = [
    path('', SectionRegistrationView.as_view(), name='section_registration'),
    path('me/', MemberMeView.as_view(), name='member_me'),
    path('roster/', RosterView.as_view(), name='roster'),
    path('sections/', SectionListView.as_view(), name='section_list'),
    path('roster-requests/', RosterRequestCreateView.as_view(), name='roster_request_create'),
]
