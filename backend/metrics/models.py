import os
import math
from datetime import datetime

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.timezone import now

from members.models import Section, Member

NUM_WEEKS = 8

START_DATE_EPOCH_TIME = int(os.getenv("START_DATE_EPOCH_TIME"))
START_DATE = datetime.fromtimestamp(START_DATE_EPOCH_TIME).date()

def get_current_week():
    return (now().date() - START_DATE).days // 7 + 1

def get_week_for_datetime(target_datetime: datetime):
    week = (target_datetime.date() - START_DATE).days // 7 + 1

    if not (1 <= week <= NUM_WEEKS):
        raise ValueError(f"Week {week} is outside the valid range 1-{NUM_WEEKS}")

    return week 


class MemberWeeklyPoints(models.Model):
    """Represents the points that a member has earned within a particular week."""

    member = models.ForeignKey(
        Member, 
        on_delete=models.CASCADE, 
        related_name='weekly_points',
        help_text=""
    )

    week = models.PositiveSmallIntegerField(
        choices=[(i, f"Week {i}") for i in range(1, NUM_WEEKS + 1)],
        help_text=""
    )

    minutes = models.PositiveIntegerField(
        default=0,
        blank=True,
        validators=[MaxValueValidator(10080)],
    )
    
    @property
    def points(self):
        """A member's point total for the week, calculated from their weekly minutes."""
        if 0 <= self.minutes <= 210:
            return self.minutes
        else:
            return math.log(self.minutes / 210, 1.01) + 210
        

    class Meta:
        verbose_name = "Member Weekly Points"
        verbose_name_plural = "Member Weekly Points"
        constraints = [models.UniqueConstraint(fields=['member', 'week'], name='unique_member_week')]

    def __str__(self):
        return f'Week {self.week} point info for {self.member.roster_name}.'
    

    
class SectionWeeklyScore(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='weekly_scores')
    week = models.PositiveSmallIntegerField(choices=[(i, f"Week {i}") for i in range(1, NUM_WEEKS + 1)],)
    total_members = models.PositiveSmallIntegerField()
    participating_members = models.PositiveSmallIntegerField()
    total_member_points = models.FloatField()
    rank_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )

    @property
    def score(self):
        return round(self.total_member_points / self.total_members, 2)

    @property 
    def percent_participation(self):
        return round(self.participating_members / self.total_members * 100, 1)
    
    class Meta:
        verbose_name = 'Section Weekly Score'
        verbose_name_plural = 'Section Weekly Scores'
        constraints = [
            models.UniqueConstraint(fields=['section', 'week'], name='unique_section_week'),
            models.UniqueConstraint(fields=['week', 'rank_score'], name='unique_week_rank')
        ]

    def __str__(self):
        return f'Week {self.week} point info for {self.section.name} section.'
    