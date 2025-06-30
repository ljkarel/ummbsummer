from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    sport_type = serializers.CharField(source='get_sport_type_display')

    class Meta:
        model = Activity
        fields = '__all__'