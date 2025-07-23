from django.core.files.base import ContentFile
from django.db import models

from members.models import Member

from .enums import SportType
from .mapbox import generate_map


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

    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"
        ordering = ['-datetime']
        db_table = 'activity'

    def __str__(self):
        return f"{self.member} on {self.datetime.strftime('%b %d')}: {self.minutes} min {self.sport_type}"

    def save(self, *args, **kwargs):
        old_map = None  # The activity's old map
        old_polyline = None  # The activity's old polyline

        # Try to get the old instance's map and polyline to compare values
        try:
            old = Activity.objects.get(pk=self.pk)
            old_polyline = old.polyline
            old_map = old.map_image
        except Activity.DoesNotExist:
            pass  # New instance

        polyline_changed = old_polyline != self.polyline
        map_missing = self.polyline and not self.map_image
        update_map = polyline_changed or map_missing

        if not update_map:
            return super().save(*args, **kwargs)

        if old_map:
            old_map.delete(save=False)

        if not self.polyline:
            self.map_image = None
            return super().save(*args, **kwargs)

        image_bytes = generate_map(self.polyline)
        if image_bytes:
            filename = f'activity_{self.activity_id}.png'
            self.map_image.save(filename, ContentFile(image_bytes), save=False)

        super().save(*args, **kwargs)
