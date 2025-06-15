from django.db import models

class WebhookEvent(models.Model):
    activity_id = models.BigIntegerField()
    member_id = models.BigIntegerField()
    event_time = models.DateTimeField()
    processed = models.BooleanField()

    
