from django.contrib import admin

from strava.api import update_member_activities
from .models import Section, Member, MemberPreferences, StravaAuth


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
        other_failures = []

        for member in queryset:
            try:
                update_member_activities(member)
                success_count += 1
            except Member.strava_auth.RelatedObjectDoesNotExist:
                missing_auth_count += 1
            except Exception as e:
                self.message_user(request, f"Failed to update {member}: {e}", level='error')

        if success_count:
            self.message_user(request, f"Successfully updated {success_count} member(s).")

        if missing_auth_count:
            self.message_user(request, f"Skipped {missing_auth_count} member(s) — no Strava authorization found.", level='info')

    actions = (update_activities,)


@admin.register(MemberPreferences)
class MemberPreferencesAdmin(admin.ModelAdmin):
    list_display = ('member', 'nickname', 'preferred_email')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'nickname')


@admin.register(StravaAuth)
class StravaAuthAdmin(admin.ModelAdmin):
    list_display = ('member', 'strava_id', 'access_token', 'refresh_token', 'token_expires', 'scope')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname')