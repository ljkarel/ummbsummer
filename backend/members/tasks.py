from celery import shared_task

from .utils import email_section_minutes_csv


@shared_task
def email_section_minutes(period_id, section_slug, emails):
    email_section_minutes_csv(period_id, section_slug, emails)
