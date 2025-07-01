from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils.timezone import now

from .models import MemberWeeklyPoints, SectionWeeklyScore, get_week_for_datetime

from .utils import recompute_sws

@receiver([post_save, post_delete], sender=MemberWeeklyPoints)
def update_section_weekly_score(sender, instance, **kwargs):
    recompute_sws(instance.member.section, instance.week)
