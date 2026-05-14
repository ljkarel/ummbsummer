from django.db.models import Sum
from django.utils.timezone import localdate

from members.models import Section

from .models import CompetitionPeriod, SectionPeriodScore, compute_points


def get_period_for_datetime(dt) -> CompetitionPeriod | None:
    """Return the CompetitionPeriod whose date range contains dt, or None."""
    target_date = dt.date() if hasattr(dt, 'date') else dt
    return CompetitionPeriod.objects.filter(
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).first()


def get_current_period() -> CompetitionPeriod | None:
    return get_period_for_datetime(localdate())


def compute_member_points_for_period(member, period: CompetitionPeriod) -> float:
    """Sum activity minutes for member within the period and apply the points formula."""
    result = member.activities.filter(
        datetime__date__gte=period.start_date,
        datetime__date__lte=period.end_date,
    ).aggregate(total=Sum('minutes'))
    minutes = result['total'] or 0
    return compute_points(minutes)


def compute_section_score_for_period(section, period: CompetitionPeriod) -> dict:
    """Compute a live (unsaved) score dict for a section in a period."""
    members = list(section.members.all())
    total_members = len(members)
    total_member_points = 0.0
    participating_members = 0

    for member in members:
        minutes = member.activities.filter(
            datetime__date__gte=period.start_date,
            datetime__date__lte=period.end_date,
        ).aggregate(total=Sum('minutes'))['total'] or 0
        if minutes > 0:
            participating_members += 1
        total_member_points += compute_points(minutes)

    score = round(total_member_points / total_members, 2) if total_members else 0.0
    participation = round(participating_members / total_members * 100, 1) if total_members else 0.0

    return {
        'section': section,
        'period': period,
        'total_members': total_members,
        'participating_members': participating_members,
        'total_member_points': total_member_points,
        'score': score,
        'percent_participation': participation,
    }


def freeze_section_period_scores(period: CompetitionPeriod) -> list[SectionPeriodScore]:
    """
    Create frozen SectionPeriodScore records for every section in the database.
    Idempotent: uses get_or_create, so re-running does not overwrite existing records.
    """
    sections = Section.objects.all()
    results = []
    for section in sections:
        data = compute_section_score_for_period(section, period)
        obj, _ = SectionPeriodScore.objects.get_or_create(
            section=section,
            period=period,
            defaults={
                'total_members': data['total_members'],
                'participating_members': data['participating_members'],
                'total_member_points': data['total_member_points'],
            },
        )
        results.append(obj)
    return results


def compute_final_score() -> list[dict]:
    """
    Sum rank scores (derived from frozen SectionPeriodScore records) across all
    periods and return sections sorted by their total, highest first.
    """
    periods = list(CompetitionPeriod.objects.all())
    section_totals: dict[str, int] = {}

    for period in periods:
        scores = list(
            SectionPeriodScore.objects.filter(period=period).select_related('section')
        )
        scores.sort(key=lambda s: s.score, reverse=True)
        n = len(scores)
        for rank, score in enumerate(scores):
            name = score.section.name
            section_totals[name] = section_totals.get(name, 0) + (n - rank)

    return sorted(
        [{'name': name, 'final_score': total} for name, total in section_totals.items()],
        key=lambda x: x['final_score'],
        reverse=True,
    )
