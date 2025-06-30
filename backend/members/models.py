import os
import requests
from datetime import datetime, timedelta, timezone

from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.utils.text import slugify


TOKEN_EXPIRY_BUFFER = timedelta(seconds=60)

# The Strava app's client ID
CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')

# The Strava app's client secret
CLIENT_SECRET = os.getenv('STRAVA_CLIENT_SECRET')

# Base Strava API URL
BASE_URL = 'https://www.strava.com/api/v3'

# URL endpoint for Strava token exchange
TOKEN_URL = f'{BASE_URL}/oauth/token'


class Section(models.Model):
    """Represents a section of the marching band."""

    name = models.CharField(
        max_length=50,
        help_text="The name of the section."
    )

    slug = models.SlugField(
        unique=True, 
        blank=True,
        help_text="URL-safe version of the section name, used in links. Auto-generated if left blank."
    )

    class Meta:
        verbose_name = "Section"
        verbose_name_plural = "Sections"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Member(models.Model):
    """Represents roster information for a member of the marching band. Generally not to be changed."""

    user = models.OneToOneField(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='member', 
        help_text="The user associated with the member."
    )

    section = models.ForeignKey(
        Section, 
        on_delete=models.CASCADE, 
        related_name='members',
        help_text="The section that the member belongs to."
    )

    first_name = models.CharField(
        max_length=50,
        help_text="The member's first name, as it appears on the roster."
    )

    last_name = models.CharField(
        max_length=50,
        help_text="The member's last name, as it appears on the roster."
    )

    year = models.PositiveSmallIntegerField(
        choices=[(1, 'Rookie'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year'), (5, '5th Year+')],
        help_text="The member's year in band."
    )

    email = models.EmailField(
        unique=True,
        help_text="The member's university email address, as it appears on the roster."
    )

    date_added = models.DateField(
        auto_now_add=True,
        help_text="The date that the member model was created."
    )

    @property
    def roster_name(self):
        """The member's full name, as it appears on the roster."""
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self):
        """The member's display name. Defaults to their roster full name."""
        nickname = getattr(self.preferences, 'nickname', None)
        return nickname or self.roster_name
    
    @property
    def contact_email(self):
        """The member's contact email. Defaults to their university email."""
        preferred_email = getattr(self.preferences, 'preferred_email', None)
        return preferred_email or self.email

    class Meta:
        verbose_name = "Member"
        verbose_name_plural = "Members"
        ordering = ['last_name', 'first_name']


    def __str__(self):
        nickname = getattr(self.preferences, 'nickname', None)
        if nickname:
            return f"{nickname} ({self.roster_name})"
        return self.roster_name
    
    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)

        # If the member is being created and doesn't have a preferences object yet, make one.
        if creating and not hasattr(self, 'preferences'):
            MemberPreferences.objects.create(member=self)


class MemberPreferences(models.Model):
    """Represents member preferences, as they have set themselves."""

    member = models.OneToOneField(
        Member, 
        on_delete=models.CASCADE, 
        related_name='preferences', 
        help_text="The member that the preferences belong to."
    )

    nickname = models.CharField(
        null=True,
        blank=True,
        max_length=50,
        help_text="The member's chosen nickname, to be displayed instead of their roster name."
    )

    preferred_email = models.EmailField(
        null=True,
        blank=True,
        help_text="The member's preferred contact email."
    )

    class Meta:
        verbose_name = "Member Preferences"
        verbose_name_plural = "Member Preferences"

    def __str__(self):
        return f"{self.member.roster_name}'s preferences"


class StravaAuth(models.Model):
    """Represents Strava access token information for a member, if they have authenticated with Strava."""

    strava_id = models.BigIntegerField(
        primary_key=True,
        help_text="The member's Strava athlete ID."
    )

    member = models.OneToOneField(
        Member, 
        on_delete=models.CASCADE, 
        related_name='strava_auth',
        help_text="The member that the access token information belongs to."
    )
    
    access_token = models.CharField(
        max_length=100,
        help_text="The member's current Strava access token. This is short-lived, and must be refreshed upon expiration."
    )
    
    refresh_token = models.CharField(
        max_length=100,
        help_text="The member's current Strava refresh token. Used to refresh the member's Strava access token."
    )
    
    token_expires = models.DateTimeField(
        help_text="The time that the member's Strava access token expires and must be refreshed."
    )
    
    scope = models.CharField(
        max_length=100,
        help_text="The scope(s) that the member's Strava access token has."
    )

    @property
    def token_expired(self):
        """Checks if the member's Strava access token is expired (or about to expire)."""
        return self.token_expires < now() + TOKEN_EXPIRY_BUFFER

    def get_valid_access_token(self):
        """Returns a valid Strava access token, refreshing it if necessary."""
        if self.token_expired:
            self.refresh_access_token()
        return self.access_token
    
    def refresh_access_token(self):
        """Refreshes the Strava access token using the refresh token."""
        response = requests.post(TOKEN_URL, data={
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'refresh_token',
            'refresh_token': self.refresh_token
        })

        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data['access_token']
            self.refresh_token = token_data['refresh_token']
            self.token_expires = datetime.fromtimestamp(token_data['expires_at'], tz=timezone.utc)
            self.save()
        else:
            raise Exception(f"Failed to refresh Strava token: {response.content}")

    class Meta:
        verbose_name = "Strava Authorization"
        verbose_name_plural = "Strava Authorizations"

    def __str__(self):
        return f"{self.member.roster_name}'s Strava authorization tokens"