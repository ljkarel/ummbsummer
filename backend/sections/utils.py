from django.db.models import Sum

from .models import SectionWeeklyScore

def compute_rank_scores(week: int):
    week_scores = list(SectionWeeklyScore.objects.filter(week=week))
    week_scores.sort(key=lambda s: s.score, reverse=True)

    max_score = len(week_scores)

    for rank, score in enumerate(week_scores):
        score.rank_score = max_score - rank
        score.save()

def compute_final_score():
    return (
        SectionWeeklyScore.objects
            .values(name='section__name')
            .annotate(final_score=Sum('rank_score'))
            .order_by('-final_score')
    )

