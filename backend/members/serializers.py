from rest_framework.serializers import ModelSerializer
from rest_framework import serializers

from .models import Member, Section

class MemberSerializer(ModelSerializer):
    class Meta:
        model = Member
        fields = ['first_name', 'last_name']

class SectionWithMembersSerializer(ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['name', 'members']
    
    def get_members(self, section):
        request = self.context.get('request')
        strava_filter = request.query_params.get('authenticated')

        qs = section.members.all()

        if strava_filter == 'true':
            qs = qs.filter(strava_auth__isnull=False)
        elif strava_filter == 'false':
            qs = qs.filter(strava_auth__isnull=True)
        
        return MemberSerializer(qs, many=True).data
    