from rest_framework import serializers

from .models import ArtSubmission


class ArtWallSubmissionSerializer(serializers.ModelSerializer):
    who = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()
    svg_path = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = ArtSubmission
        fields = ['id', 'who', 'section', 'title', 'svg_path', 'rotation', 'likes', 'liked_by_me']

    def get_who(self, obj):
        if obj.visibility == ArtSubmission.VISIBILITY_ANONYMOUS:
            return None
        return obj.member.display_name

    def get_section(self, obj):
        if obj.visibility == ArtSubmission.VISIBILITY_ANONYMOUS:
            return None
        return obj.member.section.name

    def get_svg_path(self, obj):
        if obj.activity:
            return obj.activity.svg_path or ''
        return ''

    def get_likes(self, obj):
        return obj.likes.count()

    def get_liked_by_me(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'member'):
            return False
        return obj.likes.filter(member=request.user.member).exists()


class MyArtSubmissionSerializer(serializers.ModelSerializer):
    svg_path = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    activity_id = serializers.SerializerMethodField()
    period_n = serializers.IntegerField(source='period.id', read_only=True)

    class Meta:
        model = ArtSubmission
        fields = [
            'id', 'period_n', 'activity_id', 'title', 'rotation',
            'visibility', 'is_withdrawn', 'svg_path', 'likes',
            'submitted_at', 'updated_at',
        ]

    def get_svg_path(self, obj):
        if obj.activity:
            return obj.activity.svg_path or ''
        return ''

    def get_likes(self, obj):
        return obj.likes.count()

    def get_activity_id(self, obj):
        return str(obj.activity_id) if obj.activity_id else None
