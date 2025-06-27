from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

from sections.models import Section

import math

class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member')
    section = models.ForeignKey(Section, on_delete=models.PROTECT, related_name='members')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    email = models.EmailField()
    date_added = models.DateField(auto_now_add=True)

    @property
    def real_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self):
        nickname = getattr(self.preferences, 'nickname', None)
        return nickname or self.real_name
    
    @property
    def contact_email(self):
        preferred_email = getattr(self.preferences, 'preferred_email', None)
        return preferred_email or self.email

    def __str__(self):
        nickname = getattr(self.preferences, 'nickname', None)
        if nickname:
            return f"{nickname} ({self.real_name})"
        return self.real_name
    
    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)

        if creating and not hasattr(self, 'preferences'):
            MemberPreferences.objects.create(member=self)

class StravaAuth(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='strava_auth')
    strava_id = models.BigIntegerField(primary_key=True)
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expires = models.DateTimeField()
    scope = models.TextField()

    def __str__(self):
        return f"Strava authentication data for {self.member.real_name}"


class MemberPreferences(models.Model):
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='preferences')
    nickname = models.CharField(max_length=50)
    preferred_email = models.EmailField()

    def __str__(self):
        return f"Preferences data for {self.member.real_name}"



class MemberWeeklyPoints(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='weekly_points')
    week = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    minutes = models.PositiveIntegerField()
    
    @property
    def points(self):
        """Takes in a member's weekly minutes and returns their point total"""
        if 0 <= self.minutes <= 210:
            return self.minutes
        else:
            return math.log(self.minutes / 210, 1.01) + 210

    def __str__(self):
        return f'Week {self.week} point info for {self.member.real_name}.'