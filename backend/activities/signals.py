from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver

from .models import Activity
from metrics.models import MemberWeeklyPoints, get_week_for_date
from django.utils.timezone import localtime

@receiver(pre_save, sender=Activity)
def cache_old_minutes(sender, instance, **kwargs):
    try:
        old = Activity.objects.get(pk=instance.pk)
        instance._old_minutes = old.minutes
        instance._old_week = get_week_for_date(localtime(old.datetime))
    except Activity.DoesNotExist:
        instance._old_minutes = 0
        instance._old_week = None

@receiver(post_save, sender=Activity)
def update_weekly_minutes_on_save(sender, instance, created, **kwargs):
    new_week = get_week_for_date(localtime(instance.datetime))

    if created or instance._old_week is None or instance._old_week == new_week:
        # New instance or same week
        mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=new_week)
        mwp.minutes += instance.minutes - instance._old_minutes
        mwp.save()
    else:
        # Week is different
        old_mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=instance._old_week)
        old_mwp.minutes = max(0, old_mwp.minutes - instance._old_minutes)
        old_mwp.save()

        new_mwp, _ = MemberWeeklyPoints.objects.get_or_create(member=instance.member, week=new_week)
        new_mwp.minutes += instance.minutes
        new_mwp.save()

@receiver(pre_delete, sender=Activity)
def update_weekly_minutes_on_delete(sender, instance, **kwargs):
    week = get_week_for_date(localtime(instance.datetime))

    try:
        mwp = MemberWeeklyPoints.objects.get(member=instance.member, week=week)
    except MemberWeeklyPoints.DoesNotExist:
        return
    
    mwp.minutes = max(0, mwp.minutes - instance.minutes)

    if mwp.minutes == 0:
        mwp.delete()
    else:
        mwp.save()