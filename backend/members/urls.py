from django.urls import path
from .views import SectionRegistrationView

urlpatterns = [
    path('', SectionRegistrationView.as_view(), name='section_registration'),
    # path('me/', CurrentMemberView.as_view(), name='current-member'),
    # path('me/preferences/', CurrentMemberPreferencesView.as_view(), name='current-member-preferences')
]