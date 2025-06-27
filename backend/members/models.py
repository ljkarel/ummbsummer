from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now


TOKEN_EXPIRY_BUFFER = timedelta(seconds=60)


class Section(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


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
        max_length=50,
        help_text="The member's chosen nickname, to be displayed instead of their roster name."
    )

    preferred_email = models.EmailField(
        unique=True,
        help_text="The member's preferred contact email."
    )

    def __str__(self):
        return f"Preferences data for {self.member.roster_name}"


class StravaAuth(models.Model):
    """Represents Strava access token information for a member, if they have authenticated with Strava."""
    
    member = models.OneToOneField(
        Member, 
        on_delete=models.CASCADE, 
        related_name='strava_auth',
        help_text="The member that the access token information belongs to."
    )
    
    strava_id = models.BigIntegerField(
        primary_key=True,
        help_text="The member's Strava athlete ID."
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
    
    def __str__(self):
        return f"Strava authentication data for {self.member.roster_name}"