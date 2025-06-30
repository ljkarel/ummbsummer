from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import MemberWeeklyPoints, SectionWeeklyScore
from members.models import Section

@receiver([post_save, post_delete], sender=MemberWeeklyPoints)
def update_section_weekly_score(sender, instance, **kwargs):
    section = instance.member.section
    week = instance.week

    section_members = section.members.all()
    mwps = MemberWeeklyPoints.objects.filter(member__in=section_members, week=week)

    participating_members = mwps.count()
    total_member_points = sum(mwp.points for mwp in mwps)
    total_members = section_members.count()

    swc, _ = SectionWeeklyScore.objects.update_or_create(
        section=section,
        week=week,
        defaults={
            'total_members': total_members,
            'participating_members': participating_members,
            'total_member_points': total_member_points
        }
    )