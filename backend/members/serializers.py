from rest_framework import serializers

from .models import Member, Section


class SectionNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['name', 'slug']


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


class MemberMeSerializer(serializers.Serializer):
    name = serializers.CharField()
    section = serializers.CharField(allow_null=True)
    week_minutes = serializers.IntegerField()
    week_points = serializers.FloatField()
    total_minutes = serializers.IntegerField()
    total_points = serializers.FloatField()
    streak = serializers.IntegerField()
    strava_connected = serializers.BooleanField()
    strava_scope = serializers.CharField(allow_null=True)
    nickname = serializers.CharField(allow_null=True)
    preferred_email = serializers.EmailField(allow_null=True)
    roster_email = serializers.EmailField()


class RosterMemberSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name')
    section = serializers.CharField(source='section.name')
    year = serializers.CharField(source='get_year_display')
    status = serializers.SerializerMethodField()
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['name', 'section', 'is_leader', 'year', 'status', 'is_me']

    def get_status(self, member):
        if hasattr(member, 'strava_auth'):
            return 'connected'
        if member.user_id is not None:
            return 'pending'
        return 'unregistered'

    def get_is_me(self, member):
        request = self.context.get('request')
        if request and hasattr(request.user, 'member'):
            return member.pk == request.user.member.pk
        return False
