from django.contrib import admin

from .models import ArtLike, ArtSubmission, ArtWeek

admin.site.register(ArtWeek)
admin.site.register(ArtSubmission)
admin.site.register(ArtLike)
