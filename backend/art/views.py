from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from metrics.models import CompetitionPeriod

from .models import ArtLike, ArtSubmission, ArtWeek
from .serializers import ArtWallSubmissionSerializer, MyArtSubmissionSerializer


class ArtWallView(APIView):
    """GET /api/art/wall/?period=<period_id> — public art wall for a period."""

    def get(self, request):
        period_id = request.query_params.get('period')
        if not period_id:
            return Response({'error': 'period query param required.'}, status=status.HTTP_400_BAD_REQUEST)

        period = get_object_or_404(CompetitionPeriod, pk=period_id)
        art_week = getattr(period, 'art_week', None)

        submissions = (
            ArtSubmission.objects
            .filter(
                period=period,
                is_withdrawn=False,
                visibility__in=[ArtSubmission.VISIBILITY_PUBLIC, ArtSubmission.VISIBILITY_ANONYMOUS],
            )
            .select_related('member', 'member__section', 'activity')
            .prefetch_related('likes')
        )

        # Sort by like count in Python (avoids complex annotation for now)
        submissions = sorted(submissions, key=lambda s: s.likes.count(), reverse=True)

        serializer = ArtWallSubmissionSerializer(submissions, many=True, context={'request': request})
        return Response({
            'period': period.id,
            'theme': art_week.theme if art_week else None,
            'submissions': serializer.data,
        })


class MyArtSubmissionView(APIView):
    """GET /api/art/submissions/me/?period=<period_id> — current user's submission."""

    def get(self, request):
        member = request.user.member
        period_id = request.query_params.get('period')
        if not period_id:
            return Response({'error': 'period query param required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            submission = ArtSubmission.objects.select_related('activity').get(
                member=member, period_id=period_id
            )
        except ArtSubmission.DoesNotExist:
            return Response(None)

        return Response(MyArtSubmissionSerializer(submission).data)


class ArtSubmissionView(APIView):
    """POST /api/art/submissions/ — create or update submission for a live period."""

    def post(self, request):
        member = request.user.member
        period_id = request.data.get('period')
        if not period_id:
            return Response({'error': 'period is required.'}, status=status.HTTP_400_BAD_REQUEST)

        period = get_object_or_404(CompetitionPeriod, pk=period_id)
        if period.state != 'live':
            return Response({'error': 'Submissions are only allowed during a live period.'}, status=status.HTTP_403_FORBIDDEN)

        activity_id = request.data.get('activityId')
        activity = None
        if activity_id:
            from activities.models import Activity
            try:
                activity = Activity.objects.get(activity_id=activity_id, member=member)
            except Activity.DoesNotExist:
                return Response({'error': 'Activity not found or does not belong to you.'}, status=status.HTTP_400_BAD_REQUEST)
            if activity.period_id != period.pk:
                return Response({'error': 'Activity does not fall within this period.'}, status=status.HTTP_400_BAD_REQUEST)

        submission, _ = ArtSubmission.objects.update_or_create(
            member=member,
            period=period,
            defaults={
                'activity': activity,
                'title': request.data.get('title', ''),
                'rotation': request.data.get('rotation', 0),
                'visibility': request.data.get('visibility', ArtSubmission.VISIBILITY_PUBLIC),
                'stroke_color': request.data.get('strokeColor', ''),
                'bg_color': request.data.get('bgColor', ''),
                'stroke_width': request.data.get('strokeWidth', 2.8),
                'is_withdrawn': False,
            }
        )
        return Response(MyArtSubmissionSerializer(submission).data, status=status.HTTP_200_OK)


class ArtSubmissionDetailView(APIView):
    """PATCH /api/art/submissions/<id>/ and DELETE /api/art/submissions/<id>/"""

    def _get_owned(self, request, pk):
        submission = get_object_or_404(ArtSubmission, pk=pk)
        if submission.member != request.user.member:
            return None, Response({'error': 'Not your submission.'}, status=status.HTTP_403_FORBIDDEN)
        if submission.period_id is not None and submission.period.state != 'live':
            return None, Response({'error': 'This period is no longer live.'}, status=status.HTTP_403_FORBIDDEN)
        return submission, None

    def patch(self, request, pk):
        submission, err = self._get_owned(request, pk)
        if err:
            return err

        activity_id = request.data.get('activityId')
        if activity_id:
            from activities.models import Activity
            try:
                activity = Activity.objects.get(activity_id=activity_id, member=request.user.member)
            except Activity.DoesNotExist:
                return Response({'error': 'Activity not found or does not belong to you.'}, status=status.HTTP_400_BAD_REQUEST)
            submission.activity = activity

        if 'title' in request.data:
            submission.title = request.data['title']
        if 'rotation' in request.data:
            submission.rotation = request.data['rotation']
        if 'visibility' in request.data:
            submission.visibility = request.data['visibility']
        if 'strokeColor' in request.data:
            submission.stroke_color = request.data['strokeColor']
        if 'bgColor' in request.data:
            submission.bg_color = request.data['bgColor']
        if 'strokeWidth' in request.data:
            submission.stroke_width = request.data['strokeWidth']

        submission.save()
        return Response(MyArtSubmissionSerializer(submission).data)

    def delete(self, request, pk):
        submission, err = self._get_owned(request, pk)
        if err:
            return err
        submission.is_withdrawn = True
        submission.save(update_fields=['is_withdrawn', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArtLikeToggleView(APIView):
    """POST /api/art/submissions/<id>/like/ — toggle like on a submission."""

    def post(self, request, pk):
        member = request.user.member
        submission = get_object_or_404(
            ArtSubmission,
            pk=pk,
            is_withdrawn=False,
            visibility__in=[ArtSubmission.VISIBILITY_PUBLIC, ArtSubmission.VISIBILITY_ANONYMOUS],
        )

        if submission.member == member:
            return Response({'error': 'You cannot like your own submission.'}, status=status.HTTP_403_FORBIDDEN)

        like, created = ArtLike.objects.get_or_create(submission=submission, member=member)
        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        return Response({'liked': liked, 'likesCount': submission.likes.count()})


class ArtOpenWallView(APIView):
    """GET /api/art/open-wall/ — public open (non-weekly) art wall."""

    permission_classes = [AllowAny]

    def get(self, request):
        submissions = (
            ArtSubmission.objects
            .filter(
                period__isnull=True,
                is_withdrawn=False,
                visibility__in=[ArtSubmission.VISIBILITY_PUBLIC, ArtSubmission.VISIBILITY_ANONYMOUS],
            )
            .select_related('member', 'member__section', 'activity')
            .prefetch_related('likes')
        )
        submissions = sorted(submissions, key=lambda s: s.likes.count(), reverse=True)
        serializer = ArtWallSubmissionSerializer(submissions, many=True, context={'request': request})
        return Response({'submissions': serializer.data})


class MyArtOpenSubmissionsView(APIView):
    """GET /api/art/open-submissions/me/ — current user's open submissions."""

    def get(self, request):
        member = request.user.member
        submissions = (
            ArtSubmission.objects
            .filter(member=member, period__isnull=True, is_withdrawn=False)
            .select_related('activity')
            .order_by('-submitted_at')
        )
        return Response(MyArtSubmissionSerializer(submissions, many=True).data)


class ArtOpenSubmissionCreateView(APIView):
    """POST /api/art/open-submissions/ — create a new open submission."""

    def post(self, request):
        member = request.user.member

        activity_id = request.data.get('activityId')
        activity = None
        if activity_id:
            from activities.models import Activity
            try:
                activity = Activity.objects.get(activity_id=activity_id, member=member)
            except Activity.DoesNotExist:
                return Response({'error': 'Activity not found or does not belong to you.'}, status=status.HTTP_400_BAD_REQUEST)
            if activity.period_id is None:
                return Response({'error': 'Activity does not belong to the current season.'}, status=status.HTTP_400_BAD_REQUEST)

        submission = ArtSubmission.objects.create(
            member=member,
            period=None,
            activity=activity,
            title=request.data.get('title', ''),
            rotation=request.data.get('rotation', 0),
            visibility=request.data.get('visibility', ArtSubmission.VISIBILITY_PUBLIC),
            stroke_color=request.data.get('strokeColor', ''),
            bg_color=request.data.get('bgColor', ''),
            stroke_width=request.data.get('strokeWidth', 2.8),
        )
        return Response(MyArtSubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)
