from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Section(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    
class SectionWeeklyScore(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='weekly_points')
    week = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    total_members = models.PositiveSmallIntegerField()
    participating_members = models.PositiveSmallIntegerField()
    total_member_points = models.FloatField()
    rank_score = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])

    @property
    def score(self):
        return self.total_member_points / self.total_members

    @property 
    def percent_participation(self):
        return self.participating_members / self.total_members
    
    def __str__(self):
        return f'Week {self.week} point info for {self.section.name} section.'
    