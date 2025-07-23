from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import MemberWeeklyPoints
from .utils import recompute_sws


@receiver([post_save, post_delete], sender=MemberWeeklyPoints)
def update_section_weekly_score(sender, instance, **kwargs):
    recompute_sws(instance.member.section, instance.week)
