from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.timezone import now

from .models import Activity


class SportTypeListFilter(admin.SimpleListFilter):
    """Custom filter for sport types. Only shows sport type options that actually appear in the database."""

    title = ('sport type')
    parameter_name = 'sport type'

    def lookups(self, request, model_admin):
        used_sports = Activity.all_objects.order_by('sport_type').values_list('sport_type', flat=True).distinct()
        choices_dict = dict(Activity._meta.get_field('sport_type').choices)

        lookups = [
            (sport, choices_dict.get(sport, sport))
            for sport in used_sports
        ]

        return sorted(lookups, key=lambda x: x[1])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(sport_type=self.value())
        return queryset


class StatusListFilter(admin.SimpleListFilter):
    title = 'status'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return [
            ('active', 'Active'),
            ('admin_excluded', 'Excluded by admin'),
            ('other_deleted', 'Other deleted'),
        ]

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(deleted_at__isnull=True)
        if self.value() == 'admin_excluded':
            return queryset.filter(deletion_reason='admin_excluded')
        if self.value() == 'other_deleted':
            return queryset.filter(deleted_at__isnull=False).exclude(deletion_reason='admin_excluded')
        return queryset


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('member', 'name', 'distance', 'minutes', 'sport_type', 'datetime', 'manual', 'private', 'is_deleted', 'deletion_reason')
    search_fields = ('activity_id', 'member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname', 'name')
    list_filter = (StatusListFilter, SportTypeListFilter, 'manual', 'private')
    actions = ['exclude_from_scoring', 'restore_to_scoring']

    readonly_fields = ['map_image_link', 'deleted_at', 'deletion_reason']
    exclude = ['map_image']

    def get_queryset(self, request):
        return Activity.all_objects.all()

    @admin.display(boolean=True, description="Deleted")
    def is_deleted(self, obj):
        return obj.deleted_at is not None

    def map_image_link(self, obj):
        if obj.pk and obj.map_image:
            url = reverse('activity_map', kwargs={'pk': obj.pk})
            return format_html('<a href="{}" target="_blank">View Map Image</a>', url)
        return "No image available"

    map_image_link.short_description = "Map image"

    @admin.action(description="Exclude from scoring (admin)")
    def exclude_from_scoring(self, request, queryset):
        updated = 0
        for activity in queryset.filter(deleted_at__isnull=True):
            activity.deleted_at = now()
            activity.deletion_reason = 'admin_excluded'
            activity.save(update_fields=['deleted_at', 'deletion_reason'])
            updated += 1
        self.message_user(request, f"{updated} activity/activities excluded from scoring.")

    @admin.action(description="Restore to scoring (undo admin exclusion)")
    def restore_to_scoring(self, request, queryset):
        updated = queryset.filter(deletion_reason='admin_excluded').update(
            deleted_at=None,
            deletion_reason='',
        )
        self.message_user(request, f"{updated} activity/activities restored to scoring.")
