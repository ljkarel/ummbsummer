from django.contrib import admin
from .models import SectionWeeklyScore, MemberWeeklyPoints
from .utils import recompute_sws


@admin.register(SectionWeeklyScore)
class SectionWeeklyScoreAdmin(admin.ModelAdmin):
    list_display = ('section', 'week', 'percent_participation', 'total_members', 'total_member_points', 'score', 'rank_score')
    list_filter = ('section', 'week')

    @admin.action(description="Recompute selected Section Weekly Scores")
    def update_sws(self, request, queryset):
        for sws in queryset:
            recompute_sws(sws.section, sws.week, force=True)
    
    actions = 'update_sws'


@admin.register(MemberWeeklyPoints)
class MemberWeeklyPointsAdmin(admin.ModelAdmin):
    list_display = ('member', 'week', 'minutes', 'points')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname')
    list_filter = ('week',)