from rest_framework import serializers
from .models import MemberWeeklyPoints, SectionWeeklyScore

class MemberWeeklyPointsSerializer(serializers.ModelSerializer):

    class Meta:
        model = MemberWeeklyPoints
        fields = ['week', 'minutes', 'points']

class SectionWeeklyScoreSerializer(serializers.ModelSerializer):
    section = serializers.CharField(source='section.name')

    class Meta:
        model = SectionWeeklyScore
        fields = ['section', 'week', 'total_members', 'participating_members', 'total_member_points', 'rank_score', 'score', 'percent_participation']
    
    