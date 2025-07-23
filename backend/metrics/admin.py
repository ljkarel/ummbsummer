from django.contrib import admin

from .models import MemberWeeklyPoints, SectionWeeklyScore
from .utils import recompute_sws


@admin.register(SectionWeeklyScore)
class SectionWeeklyScoreAdmin(admin.ModelAdmin):
    list_display = ('section', 'week', 'participating_members', 'total_members', 'percent_participation', 'total_member_points', 'score', 'rank_score')
    list_filter = ('section', 'week')

    @admin.action(description="Recompute selected Section Weekly Scores")
    def update_sws(self, request, queryset):
        if not request.user.has_perm('metrics.can_recompute_sws'):
            self.message_user(request, "You do not have permission to perform this action.", level='error')
            return
        for sws in queryset:
            recompute_sws(sws.section, sws.week, force=True)

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.has_perm('metrics.can_recompute_sws'):
            actions.pop('update_sws', None)
        return actions

    actions = ('update_sws',)


@admin.register(MemberWeeklyPoints)
class MemberWeeklyPointsAdmin(admin.ModelAdmin):
    list_display = ('member', 'week', 'minutes', 'points')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname')
    list_filter = ('week',)
