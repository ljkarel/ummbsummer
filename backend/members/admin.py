from django.contrib import admin
from .models import Section, Member, StravaAuth

admin.site.register([
    Section,
    Member,
    StravaAuth
])