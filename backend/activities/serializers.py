from rest_framework.serializers import ModelSerializer
from .models import Activity

class ActivitySerializer(ModelSerializer):
    class Meta:
        model = Activity
        fields = ['activity_id', 'name', 'datetime', 'type', 'minutes', 'distance', 'manual', 'private']
