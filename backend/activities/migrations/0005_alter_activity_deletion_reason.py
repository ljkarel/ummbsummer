from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0004_alter_activity_deletion_reason'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='deletion_reason',
            field=models.CharField(blank=True, choices=[('strava_delete', 'Deleted on Strava'), ('strava_deauth', 'Strava access revoked'), ('sync_missing', 'Not found during sync'), ('date_out_of_range', 'Date outside all competition periods'), ('admin_excluded', 'Excluded by admin')], default='', help_text='Why this activity was soft-deleted.', max_length=20),
        ),
    ]
