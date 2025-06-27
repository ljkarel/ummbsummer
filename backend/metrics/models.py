import os
import math
from datetime import datetime

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.timezone import now

from members.models import Section, Member

NUM_WEEKS = 8

START_DATE_EPOCH_TIME = os.getenv("START_DATE_EPOCH_TIME")
START_DATE = datetime.fromtimestamp(START_DATE_EPOCH_TIME).date()

def get_current_week():
    return (now().date() - START_DATE).days // 7 + 1


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

    minutes = models.PositiveIntegerField()
    
    @property
    def points(self):
        """A member's point total for the week, calculated from their weekly minutes."""
        if 0 <= self.minutes <= 210:
            return self.minutes
        else:
            return math.log(self.minutes / 210, 1.01) + 210

    def __str__(self):
        return f'Week {self.week} point info for {self.member.roster_name}.'
    

    
class SectionWeeklyScore(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='weekly_points')
    week = models.PositiveSmallIntegerField(choices=[(i, f"Week {i}") for i in range(1, NUM_WEEKS + 1)],)
    total_members = models.PositiveSmallIntegerField()
    participating_members = models.PositiveSmallIntegerField()
    total_member_points = models.FloatField()
    rank_score = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])

    @property
    def score(self):
        return self.total_member_points / self.total_members

    @property 
    def percent_participation(self):
        return self.participating_members / self.total_members
    
    def __str__(self):
        return f'Week {self.week} point info for {self.section.name} section.'
    