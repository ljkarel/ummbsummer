from members.models import MemberWeeklyPoints
from sections.models import SectionWeeklyScore


def add_to_member_minutes(member_weekly_points: MemberWeeklyPoints, minutes: int):
    section = member_weekly_points.member.section
    week = member_weekly_points.week
    section_weekly_score = SectionWeeklyScore.objects.get(section=section, week=week)

    old_member_points = member_weekly_points.points

    member_weekly_points.minutes += minutes
    member_weekly_points.save()

    new_member_points = member_weekly_points.points

    difference = new_member_points - old_member_points

    section_weekly_score.total_member_points += difference
    section_weekly_score.save()

    