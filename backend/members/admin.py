from django.contrib import admin
from .models import Section, StravaAuth, Member

admin.site.register([
    Section,
    StravaAuth,
    Member
])