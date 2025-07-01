from django.contrib import admin
from .models import Activity


class SportTypeListFilter(admin.SimpleListFilter):
    """Custom filter for sport types. Only shows sport type options that actually appear in the database."""
    title = ('sport type')
    parameter_name = 'sport type'

    def lookups(self, request, model_admin):
        used_sports = Activity.objects.values_list('sport_type', flat=True).distinct()
        choices_dict = dict(Activity._meta.get_field('sport_type').choices)

        lookups = {
            choices_dict.get(sport, sport): (sport, choices_dict.get(sport, sport))
            for sport in used_sports
        }

        return sorted(lookups.values(), key=lambda x: x[1])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(sport_type=self.value())
        return queryset


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('member', 'name', 'distance', 'minutes', 'sport_type', 'datetime', 'manual', 'private')
    search_fields = ('member__first_name', 'member__last_name', 'member__email', 'member__preferences__nickname', 'name')
    list_filter = (SportTypeListFilter, 'manual', 'private')
