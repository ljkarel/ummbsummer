import math
import os
from datetime import datetime

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.timezone import now

from members.models import Member, Section

NUM_WEEKS = 8
WEEK_CHOICES = [(i, f"Week {i}") for i in range(1, NUM_WEEKS + 1)]

START_DATE_EPOCH_TIME = int(os.getenv("START_DATE_EPOCH_TIME"))
START_DATE = datetime.fromtimestamp(START_DATE_EPOCH_TIME).date()


def get_current_week():
    """Returns the current week, calculated from the challenge start date."""
    return (now().date() - START_DATE).days // 7 + 1


def get_week_for_datetime(target_datetime: datetime):
    """Returns the week for a given datetime, calculated from the challenge start date."""
    week = (target_datetime.date() - START_DATE).days // 7 + 1

    if not 1 <= week <= NUM_WEEKS:
        raise ValueError(f"Week {week} is outside the valid range 1-{NUM_WEEKS}")

    return week


class MemberWeeklyPoints(models.Model):
    """Represents the points that a member has earned within a particular week."""

    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='weekly_points',
        help_text="The associated member that the weekly points are for."
    )

    week = models.PositiveSmallIntegerField(
        choices=WEEK_CHOICES,
        help_text="The week in which the points were earned."
    )

    minutes = models.PositiveIntegerField(
        default=0,
        blank=True,
        validators=[MaxValueValidator(10080)],
        help_text="The total number of minutes that the member completed in the given week."
    )

    points = models.FloatField(
        editable=False,
        validators=[MinValueValidator(0)],
        help_text="A member's point total for the week, calculated from their weekly minutes."
    )

    def compute_points(self):
        if 0 <= self.minutes <= 210:
            return self.minutes
        return math.log(self.minutes / 210, 1.01) + 210

    class Meta:
        verbose_name = "Member Weekly Points"
        verbose_name_plural = "Member Weekly Points"
        constraints = [
            models.UniqueConstraint(fields=['member', 'week'], name='unique_member_week')
        ]
        db_table = 'member_weekly_points'

    def save(self, *args, **kwargs):
        self.points = self.compute_points()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Week {self.week} point info for {self.member.roster_name}.'


class SectionWeeklyScore(models.Model):
    """Represents the score for a section for a particular week."""

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='weekly_scores',
        help_text="The associated section that the weekly score is for."
    )

    week = models.PositiveSmallIntegerField(
        choices=WEEK_CHOICES,
        help_text="The week in which the score was calculated."
    )

    total_members = models.PositiveSmallIntegerField(
        help_text="The total number of members in the section for this week."
    )

    participating_members = models.PositiveSmallIntegerField(
        help_text=(
            "The number of participating members in the section for this week. "
            "Participation means being registered and having completed activity minutes."
        )
    )

    total_member_points = models.FloatField(
        help_text="The total number of points earned by all members in the section for this week."
    )

    rank_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="A score from 1-12 giving the section's rank among other sections for this week."
    )

    @property
    def score(self):
        """Computes the section score for the week by taking an average of member points."""
        if self.total_members == 0:
            return 0.0
        return round(self.total_member_points / self.total_members, 2)

    @property
    def percent_participation(self):
        """Computes the section percent participation for the week."""
        if self.total_members == 0:
            return 0.0
        return round(self.participating_members / self.total_members * 100, 1)

    class Meta:
        verbose_name = 'Section Weekly Score'
        verbose_name_plural = 'Section Weekly Scores'
        constraints = [
            models.UniqueConstraint(fields=['section', 'week'], name='unique_section_week'),
            models.UniqueConstraint(fields=['week', 'rank_score'], name='unique_week_rank')
        ]
        db_table = 'section_weekly_score'
        permissions = [
            ('can_recompute_sws', 'Can recompute Section Weekly Scores')
        ]

    def clean(self):
        if self.pariticipating_members > self.total_members:
            raise ValidationError("Participating members cannot exceed total members.")

    def __str__(self):
        return f'Week {self.week} point info for {self.section.name} section.'
