from django.db import models


class ArtWeek(models.Model):
    """Art challenge metadata for a competition period."""

    period = models.OneToOneField(
        'metrics.CompetitionPeriod',
        on_delete=models.CASCADE,
        related_name='art_week',
        help_text="The competition period this art challenge covers."
    )
    theme = models.CharField(
        max_length=100,
        help_text="The art theme for this period (e.g. 'Loop', 'Letter M')."
    )

    class Meta:
        db_table = 'art_week'

    def __str__(self):
        return f"{self.period} — {self.theme}"


class ArtSubmission(models.Model):
    VISIBILITY_PUBLIC = 'public'
    VISIBILITY_ANONYMOUS = 'anonymous'
    VISIBILITY_PRIVATE = 'private'

    VISIBILITY_CHOICES = [
        (VISIBILITY_PUBLIC, 'Public'),
        (VISIBILITY_ANONYMOUS, 'Anonymous'),
        (VISIBILITY_PRIVATE, 'Private'),
    ]

    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='art_submissions',
        help_text="The member who submitted this artwork."
    )
    period = models.ForeignKey(
        'metrics.CompetitionPeriod',
        on_delete=models.CASCADE,
        related_name='art_submissions',
        help_text="The competition period this submission is for."
    )
    activity = models.ForeignKey(
        'activities.Activity',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='art_submissions',
        help_text="The activity whose route is used as the artwork."
    )
    title = models.CharField(max_length=100)
    rotation = models.PositiveSmallIntegerField(
        default=0,
        help_text="Rotation in degrees (0, 45, 90, ..., 315)."
    )
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default=VISIBILITY_PUBLIC,
    )
    stroke_color = models.CharField(max_length=20, blank=True, default='')
    bg_color = models.CharField(max_length=20, blank=True, default='')
    stroke_width = models.FloatField(default=2.8)
    is_withdrawn = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'art_submission'
        unique_together = ('member', 'period')

    def __str__(self):
        return f"{self.member} — {self.period.name} — {self.title}"

    @property
    def likes_count(self):
        return self.likes.count()


class ArtLike(models.Model):
    submission = models.ForeignKey(
        ArtSubmission,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='art_likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'art_like'
        unique_together = ('submission', 'member')

    def __str__(self):
        return f"{self.member} likes {self.submission}"
