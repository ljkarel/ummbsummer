from django.db import models
from django.contrib.auth.models import User


class Section(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class StravaAuth(models.Model):
    strava_id = models.BigIntegerField(primary_key=True)
    access_token = models.TextField(null=True, blank=True)
    refresh_token = models.TextField(null=True, blank=True)
    token_expires = models.DateTimeField(null=True, blank=True)
    scope = models.TextField(null=True, default=True)

    def __str__(self):
        return f"Strava authentication data for {self.strava_id}"


class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member')
    section = models.ForeignKey(Section, on_delete=models.PROTECT, related_name='members')
    strava_auth = models.OneToOneField(StravaAuth, on_delete=models.SET_NULL, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    email = models.EmailField()
    date_added = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    


