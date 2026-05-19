from rest_framework import serializers

from metrics.models import compute_points

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    sport_type = serializers.CharField(source='get_sport_type_display')
    map_image = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    period_n = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = '__all__'

    def get_map_image(self, obj):
        request = self.context.get('request')
        if obj.map_image:
            path = f'/api/activities/{obj.pk}/map'
            return request.build_absolute_uri(path) if request else path
        return None

    def get_points(self, obj):
        if not obj.period_id:
            return round(compute_points(obj.minutes), 2)

        cache_key = f'pa_{obj.member_id}_{obj.period_id}'
        if cache_key not in self.context:
            qs = Activity.objects.filter(
                member_id=obj.member_id,
                period_id=obj.period_id,
            ).order_by('datetime').values_list('activity_id', 'minutes')
            self.context[cache_key] = list(qs)

        cumulative = 0
        for act_id, mins in self.context[cache_key]:
            prev = compute_points(cumulative)
            cumulative += mins
            if act_id == obj.activity_id:
                return round(compute_points(cumulative) - prev, 2)

        return round(compute_points(obj.minutes), 2)

    def get_period_n(self, obj):
        return obj.period.name if obj.period_id else None
