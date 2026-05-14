from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils.timezone import localtime

from metrics.utils import get_period_for_datetime

from .models import Activity


@receiver(post_save, sender=Activity)
def validate_activity_period(sender, instance, **kwargs):
    """Delete the activity if it falls outside all competition periods."""
    period = get_period_for_datetime(localtime(instance.datetime))
    if period is None:
        instance.delete()


@receiver(post_delete, sender=Activity)
def delete_activity_image_file(sender, instance, **kwargs):
    if instance.map_image:
        instance.map_image.delete(save=False)
