from django.contrib import admin

from .models import Competition, CompetitionPeriod, SectionPeriodScore
from .utils import freeze_section_period_scores


class CompetitionPeriodInline(admin.TabularInline):
    model = CompetitionPeriod
    extra = 0


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    inlines = [CompetitionPeriodInline]


@admin.register(CompetitionPeriod)
class CompetitionPeriodAdmin(admin.ModelAdmin):
    list_display = ('name', 'competition', 'start_date', 'end_date')
    list_filter = ('competition',)

    @admin.action(description="Freeze scores for selected periods")
    def freeze_scores(self, request, queryset):
        if not request.user.has_perm('metrics.can_freeze_period_scores'):
            self.message_user(request, "You do not have permission to perform this action.", level='error')
            return
        for period in queryset:
            freeze_section_period_scores(period)
        self.message_user(request, f"Scores frozen for {queryset.count()} period(s).")

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.has_perm('metrics.can_freeze_period_scores'):
            actions.pop('freeze_scores', None)
        return actions

    actions = ('freeze_scores',)


@admin.register(SectionPeriodScore)
class SectionPeriodScoreAdmin(admin.ModelAdmin):
    list_display = ('section', 'period', 'participating_members', 'total_members', 'percent_participation', 'total_member_points', 'score')
    list_filter = ('section', 'period')
