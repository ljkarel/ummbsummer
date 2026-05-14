import math

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from members.models import Section


def compute_points(minutes: int) -> float:
    if 0 <= minutes <= 210:
        return float(minutes)
    return math.log(minutes / 210, 1.01) + 210


class Competition(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = 'competition'

    def __str__(self):
        return self.name


class CompetitionPeriod(models.Model):
    competition = models.ForeignKey(
        Competition,
        on_delete=models.CASCADE,
        related_name='periods',
    )
    name = models.CharField(max_length=50, help_text="e.g., 'Week 1'")
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = 'competition_period'
        ordering = ['start_date']

    def clean(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("start_date must be before end_date.")

        # Enforce non-overlapping periods within the same competition
        qs = CompetitionPeriod.objects.filter(competition=self.competition)
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        overlap = qs.filter(start_date__lte=self.end_date, end_date__gte=self.start_date)
        if overlap.exists():
            raise ValidationError("This period overlaps with an existing period in the same competition.")

    def __str__(self):
        return f"{self.competition.name} — {self.name}"


class SectionPeriodScore(models.Model):
    """Frozen score for a section at the close of a competition period."""

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='period_scores',
    )
    period = models.ForeignKey(
        CompetitionPeriod,
        on_delete=models.CASCADE,
        related_name='section_scores',
    )
    total_members = models.PositiveSmallIntegerField(
        help_text="Members in the section at freeze time."
    )
    participating_members = models.PositiveSmallIntegerField(
        help_text="Members with at least one activity minute in this period."
    )
    total_member_points = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text="Sum of per-member computed points for this period.",
    )

    @property
    def score(self):
        if self.total_members == 0:
            return 0.0
        return round(self.total_member_points / self.total_members, 2)

    @property
    def percent_participation(self):
        if self.total_members == 0:
            return 0.0
        return round(self.participating_members / self.total_members * 100, 1)

    class Meta:
        verbose_name = 'Section Period Score'
        verbose_name_plural = 'Section Period Scores'
        constraints = [
            models.UniqueConstraint(fields=['section', 'period'], name='unique_section_period')
        ]
        db_table = 'section_period_score'
        permissions = [
            ('can_freeze_period_scores', 'Can freeze Section Period Scores')
        ]

    def clean(self):
        if self.participating_members > self.total_members:
            raise ValidationError("Participating members cannot exceed total members.")

    def __str__(self):
        return f'{self.period.name} score for {self.section.name}'
