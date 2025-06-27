from django.db import models

from members.models import Member


class Activity(models.Model):
    activity_id = models.BigIntegerField(primary_key=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=255)
    distance = models.FloatField(blank=True, default=0)
    minutes = models.IntegerField(blank=True, default=0)
    elapsed_time = models.IntegerField(blank=True, default=0)
    elevation_gain = models.FloatField(blank=True, default=0)
    type = models.CharField(max_length=255)
    datetime = models.DateTimeField()
    polyline = models.TextField(blank=True, null=True)
    manual = models.BooleanField()
    private = models.BooleanField()

    def __str__(self):
        return f"{self.member.first_name} {self.member.lastName} - {self.type} - {self.minutes} minutes - {self.datetime.month}/{self.datetime.day}"