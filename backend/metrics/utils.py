from django.db.models import Sum
from django.utils.timezone import now

from .models import SectionWeeklyScore, MemberWeeklyPoints, get_week_for_datetime

def recompute_sws(section, week, force=False):
    current_week = get_week_for_datetime(now())

    # Only update current week, unless overriden by admin action
    if not force and week != current_week:
        return

    section_members = section.members.all()
    mwps = MemberWeeklyPoints.objects.filter(member__in=section_members, week=week)

    participating_members = mwps.count()
    total_member_points = sum(mwp.points for mwp in mwps)
    total_members = len(section_members)

    SectionWeeklyScore.objects.update_or_create(
        section=section,
        week=week,
        defaults={
            'total_members': total_members,
            'participating_members': participating_members,
            'total_member_points': total_member_points
        }
    )

def compute_rank_scores(week: int):
    week_scores = list(SectionWeeklyScore.objects.filter(week=week))
    week_scores.sort(key=lambda s: s.score, reverse=True)

    max_score = len(week_scores)

    for rank, score in enumerate(week_scores):
        score.rank_score = max_score - rank
        score.save()

def compute_final_score():
    return (
        SectionWeeklyScore.objects
            .values(name='section__name')
            .annotate(final_score=Sum('rank_score'))
            .order_by('-final_score')
    )