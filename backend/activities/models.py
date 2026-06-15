from django.db import models
from django.utils.timezone import now

from members.models import Member

from .enums import SportType
from .utils import polyline_to_svg_path

DELETION_REASONS = [
    ('strava_delete', 'Deleted on Strava'),
    ('strava_deauth', 'Strava access revoked'),
    ('sync_missing', 'Not found during sync'),
    ('date_out_of_range', 'Date outside all competition periods'),
    ('admin_excluded', 'Excluded by admin'),
]


class ActiveActivityManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class Activity(models.Model):
    """Represents information for a single completed activity by a particular member."""

    activity_id = models.BigIntegerField(
        primary_key=True,
        help_text="The Strava activity ID for the activity."
    )

    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='activities',
        help_text="The member that the activity belongs to."
    )

    name = models.CharField(
        max_length=255,
        help_text="The name of the activity (e.g., 'Morning Run')."
    )

    distance = models.FloatField(
        blank=True,
        default=0,
        help_text="The distance (in miles) of the activity (if applicable)."
    )

    minutes = models.IntegerField(
        blank=True,
        default=0,
        help_text="The duration of the activity, in minutes."
    )

    elapsed_time = models.IntegerField(
        blank=True,
        default=0,
        help_text="The total elapsed time of the activity, in minutes. Includes pauses."
    )

    elevation_gain = models.FloatField(
        blank=True,
        default=0,
        help_text="The total elevation gain of the activity, in feet (if applicable)."
    )

    sport_type = models.CharField(
        max_length=50,
        choices=SportType.choices,
        help_text="The type of activity (e.g., Run, Ride, Walk)."
    )

    datetime = models.DateTimeField(
        help_text="The date and time that the activity started."
    )

    polyline = models.TextField(
        blank=True,
        default='',
        help_text="The encoded polyline representing the GPS route (if applicable)."
    )

    manual = models.BooleanField(
        help_text="Whether the activity was entered manually."
    )

    private = models.BooleanField(
        help_text="Whether the activity is marked as private."
    )

    map_image = models.ImageField(
        upload_to='activity_maps/',
        blank=True,
        null=True
    )

    svg_path = models.TextField(
        blank=True,
        default='',
        help_text="SVG path d attribute derived from the encoded polyline, for art visualization."
    )

    svg_view_box = models.CharField(
        max_length=50,
        blank=True,
        default='0 0 100 100',
        help_text="SVG viewBox for svg_path, reflecting the route's true aspect ratio."
    )

    period = models.ForeignKey(
        'metrics.CompetitionPeriod',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='activities',
        help_text="The competition period this activity falls within."
    )

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Set when the activity is soft-deleted (removed from Strava or access revoked)."
    )

    deletion_reason = models.CharField(
        max_length=20,
        choices=DELETION_REASONS,
        blank=True,
        default='',
        help_text="Why this activity was soft-deleted."
    )

    objects = ActiveActivityManager()
    all_objects = models.Manager()

    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        ordering = ['-datetime']
        db_table = 'activity'

    def __str__(self):
        return f"{self.member} on {self.datetime.strftime('%b %d')}: {self.minutes} min {self.sport_type}"

    def soft_delete(self, reason: str):
        if not self.deleted_at:
            self.deleted_at = now()
            self.deletion_reason = reason
            self.save(update_fields=['deleted_at', 'deletion_reason'])

    def save(self, *args, **kwargs):
        old_polyline = None

        try:
            old = Activity.all_objects.get(pk=self.pk)
            old_polyline = old.polyline
        except Activity.DoesNotExist:
            pass

        polyline_changed = old_polyline != self.polyline

        # Keep svg_path in sync with polyline
        if polyline_changed or not self.svg_path:
            if self.polyline:
                print(f"Updating SVG path for activity {self.activity_id} (polyline length {len(self.polyline)})")
                self.svg_path, self.svg_view_box = polyline_to_svg_path(self.polyline)
            else:
                self.svg_path, self.svg_view_box = '', '0 0 100 100'

        if self.datetime:
            from metrics.utils import get_period_for_datetime
            self.period = get_period_for_datetime(self.datetime)

        # Mapbox disabled — skip image generation
        # if update_map:
        #     if old_map:
        #         old_map.delete(save=False)
        #     if not self.polyline:
        #         self.map_image = None
        #     else:
        #         image_bytes = generate_map(self.polyline)
        #         if image_bytes:
        #             filename = f'activity_{self.activity_id}.png'
        #             self.map_image.save(filename, ContentFile(image_bytes), save=False)

        super().save(*args, **kwargs)
