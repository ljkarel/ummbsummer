from celery import shared_task
from django.utils.timezone import now

from activities.models import Activity
from members.models import Member, StravaAuth

from .utils import update_all_member_activities, update_member_activities


@shared_task
def process_strava_webhook(event):
    strava_id = event.get('owner_id')

    member = Member.objects.filter(strava_auth__strava_id=strava_id).first()
    if not member:
        print(f"Strava ID {strava_id} not registered with application, skipping...")
        return

    object_type = event.get('object_type')
    aspect_type = event.get('aspect_type')
    updates = event.get('updates', {})

    if object_type == 'athlete':
        if updates.get('authorized') == 'false':
            print(f"{member} revoked Strava access, soft-deleting all Strava activities...")
            try:
                member.strava_auth.revoke()
            except StravaAuth.DoesNotExist:
                pass
            Activity.objects.filter(member=member, manual=False).update(
                deleted_at=now(),
                deletion_reason='strava_deauth',
            )
        return

    if object_type != 'activity':
        return

    activity_id = event.get('object_id')

    if aspect_type == 'delete':
        print(f"Activity {activity_id} deleted for {member}, soft-deleting...")
        try:
            activity = Activity.all_objects.get(activity_id=activity_id, member=member)
            activity.soft_delete('strava_delete')
        except Activity.DoesNotExist:
            pass
        return

    print(f"{member} {aspect_type}d activity {activity_id}, refetching all activities...")
    update_member_activities(member)


@shared_task
def sync_member_activities(member_id):
    member = Member.objects.filter(pk=member_id, strava_auth__isnull=False).first()
    if not member:
        return
    update_member_activities(member)


@shared_task
def update_activities():
    update_all_member_activities()
