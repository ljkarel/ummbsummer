from rest_framework import serializers

from .models import Member, Section


class MemberSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name')
    registered = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['name', 'registered']

    def get_registered(self, member):
        return hasattr(member, 'strava_auth')


class SectionSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True)

    class Meta:
        model = Section
        fields = ['name', 'members']