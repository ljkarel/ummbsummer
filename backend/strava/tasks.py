from celery import shared_task

from members.models import Member

from .utils import update_all_member_activities, update_member_activities


@shared_task
def process_strava_webhook(event):
    strava_id = event.get('owner_id')

    member = Member.objects.filter(strava_auth__strava_id=strava_id).first()
    if not member:
        print(f"Strava ID {strava_id} not registered with application, skipping...")
        return

    if event.get('object_type') != 'activity':
        return

    aspect_type = event.get('aspect_type')
    activity_id = event.get('object_id')

    if aspect_type == 'delete':
        print(f"Activity {activity_id} deleted for {member} — not handled yet.")
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
