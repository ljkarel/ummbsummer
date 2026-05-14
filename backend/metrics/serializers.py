from rest_framework import serializers

from .models import SectionPeriodScore


class SectionPeriodScoreSerializer(serializers.ModelSerializer):
    section = serializers.CharField(source='section.name')
    period = serializers.CharField(source='period.name')
    score = serializers.FloatField()
    percent_participation = serializers.FloatField()

    class Meta:
        model = SectionPeriodScore
        fields = ['section', 'period', 'total_members', 'participating_members', 'total_member_points', 'score', 'percent_participation']


class LiveSectionScoreSerializer(serializers.Serializer):
    section = serializers.CharField(source='section.name')
    period = serializers.CharField(source='period.name')
    total_members = serializers.IntegerField()
    participating_members = serializers.IntegerField()
    total_member_points = serializers.FloatField()
    score = serializers.FloatField()
    percent_participation = serializers.FloatField()
