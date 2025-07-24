from celery import shared_task

from members.models import Member

from .utils import update_member_activities, update_all_member_activities


@shared_task
def process_strava_webhook(event):
    strava_id = event.get('owner_id')

    member = Member.objects.filter(strava_auth__strava_id=strava_id).first()
    if not member:
        print(f"Strava ID {strava_id} not registered with application, skipping...")
        return

    if event.get('object_type') == 'activity':
        print(f"{member} updated an activity.")
        print(f"Action: {event.get('aspect_type')}")
        # update_member_activities(member)


@shared_task
def update_activities():
    update_all_member_activities()