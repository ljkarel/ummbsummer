from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from django.utils.timezone import localtime

from .models import Activity
from metrics.models import MemberWeeklyPoints, get_week_for_datetime


def update_or_delete_mwp(mwp, new_minutes):
    mwp.minutes = max(0, new_minutes)
    if mwp.minutes == 0:
        mwp.delete()
    else:
        mwp.save()


@receiver(pre_save, sender=Activity)
def cache_old_minutes(sender, instance, **kwargs):
    """Stores temporary information in the activity instance, indicating its old minutes and week."""
    try:
        old = Activity.objects.get(pk=instance.pk)
        instance._old_minutes = old.minutes
        instance._old_week = get_week_for_datetime(localtime(old.datetime))
    except Activity.DoesNotExist:
        instance._old_minutes = 0
        instance._old_week = None


@receiver(post_save, sender=Activity)
def update_weekly_minutes_on_save(sender, instance, created, **kwargs):
    """Updates activity minutes in corresponding MemberWeeklyPoints."""

    # Get the week that the updated activity is in
    try:
        new_week = get_week_for_datetime(localtime(instance.datetime))
    except ValueError:
        # Activity is outside challenge range, delete it
        if not created and instance._old_minutes > 0:
            old_mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=instance._old_week)
            update_or_delete_mwp(old_mwp, old_mwp.minutes - instance._old_minutes)
        instance.delete()
        return


    if created or instance._old_week == new_week:
        # New activity or same-week update
        mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=new_week)
        delta = instance.minutes - instance._old_minutes
        if delta != 0:
            update_or_delete_mwp(mwp, mwp.minutes + delta)
    else:
        # Week has changed, move minutes between weeks
        if instance._old_minutes > 0:
            old_mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=instance._old_week)
            update_or_delete_mwp(old_mwp, old_mwp.minutes - instance._old_minutes)

        new_mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=new_week)
        update_or_delete_mwp(new_mwp, new_mwp.minutes + instance.minutes)


@receiver(pre_delete, sender=Activity)
def update_weekly_minutes_on_delete(sender, instance, **kwargs):
    """Removes activity minutes from corresponding MemberWeeklyPoints."""
    week = get_week_for_datetime(localtime(instance.datetime))

    try:
        mwp = MemberWeeklyPoints.objects.get(member=instance.member, week=week)
        update_or_delete_mwp(mwp, mwp.minutes - instance.minutes)
    except MemberWeeklyPoints.DoesNotExist:
        pass