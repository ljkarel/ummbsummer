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
        return round(compute_points(obj.minutes), 2)

    def get_period_n(self, obj):
        return obj.period.name if obj.period_id else None
