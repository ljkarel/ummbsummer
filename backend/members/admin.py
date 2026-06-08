import traceback

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.db.models import Q, Sum

from strava.utils import update_member_activities

from metrics.models import CompetitionPeriod, compute_points

from .models import Member, MemberPreferences, MemberWeeklyScore, Section, StravaAuth


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'member_count')

    @admin.display(description='Member Count')
    def member_count(self, section):
        return section.members.count()


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'section', 'year')
    search_fields = ('first_name', 'last_name', 'preferences__nickname', 'email')
    list_filter = ('section', 'year')

    @admin.action(description="Update activities for selected Members")
    def update_activities(self, request, queryset):
        success_count = 0
        missing_auth_count = 0
        failed_members = []

        for member in queryset:
            try:
                update_member_activities(member)
                success_count += 1
            except Member.strava_auth.RelatedObjectDoesNotExist:
                missing_auth_count += 1
            except Exception as e:
                failed_members.append(member)
                tb = traceback.format_exc()
                self.message_user(request, f"Failed to update {member}: {e}\n{tb}", level='error')

        if success_count:
            self.message_user(request, f"Successfully updated {success_count} member(s).")

        if missing_auth_count:
            self.message_user(request, f"Skipped {missing_auth_count} member(s) — no Strava authorization found.", level='info')

        if failed_members:
            names = ', '.join(str(member) for member in failed_members)
            self.message_user(request, f"Failed to update the following member(s): {names}", level='error')

    actions = ('update_activities',)


class PeriodListFilter(SimpleListFilter):
    title = 'week'
    parameter_name = 'period'

    def lookups(self, request, model_admin):
        return [(p.pk, str(p)) for p in CompetitionPeriod.objects.all()]

    def queryset(self, request, queryset):
        return queryset


@admin.register(MemberWeeklyScore)
class MemberWeeklyScoreAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'section', 'display_minutes', 'display_points')
    list_display_links = None
    list_filter = (PeriodListFilter, 'section')
    search_fields = ('first_name', 'last_name', 'preferences__nickname', 'email')

    def get_actions(self, _request):
        return {}

    def has_add_permission(self, _request):
        return False

    def has_change_permission(self, _request, _obj=None):
        return False

    def has_delete_permission(self, _request, _obj=None):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        period_id = request.GET.get('period')
        activity_filter = Q(activities__deleted_at__isnull=True)
        if period_id:
            activity_filter &= Q(activities__period_id=period_id)
        return qs.annotate(total_minutes=Sum('activities__minutes', filter=activity_filter))

    @admin.display(description='Minutes', ordering='total_minutes')
    def display_minutes(self, obj):
        return obj.total_minutes or 0

    @admin.display(description='Points', ordering='total_minutes')
    def display_points(self, obj):
        return round(compute_points(obj.total_minutes or 0), 1)


@admin.register(MemberPreferences)
class MemberPreferencesAdmin(admin.ModelAdmin):
    list_display = ('member', 'nickname', 'preferred_email')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'nickname')


@admin.register(StravaAuth)
class StravaAuthAdmin(admin.ModelAdmin):
    list_display = ('member', 'strava_id', 'access_token', 'refresh_token', 'token_expires', 'scope')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname')
