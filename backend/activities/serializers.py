from rest_framework import serializers

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    sport_type = serializers.CharField(source='get_sport_type_display')
    map_image = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = '__all__'

    def get_map_image(self, obj):
        request = self.context.get('request')
        if obj.map_image:
            path = f'/api/activities/{obj.pk}/map'
            return request.build_absolute_uri(path) if request else path
        return None
