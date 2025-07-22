from celery import shared_task
from .utils import update_member_activities
from members.models import Member


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