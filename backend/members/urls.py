from django.urls import path

from .views import MemberMeView, RosterView, SectionListView, SectionRegistrationView, SubmitFeedbackView, SubmitRosterRequestView

urlpatterns = [
    path('', SectionRegistrationView.as_view(), name='section_registration'),
    path('me/', MemberMeView.as_view(), name='member_me'),
    path('roster/', RosterView.as_view(), name='roster'),
    path('sections/', SectionListView.as_view(), name='section_list'),
    path('roster-requests/', SubmitRosterRequestView.as_view(), name='roster_request_create'),
    path('feedback/', SubmitFeedbackView.as_view(), name='submit_feedback'),
]
