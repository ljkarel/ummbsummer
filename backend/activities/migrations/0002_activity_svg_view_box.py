from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='svg_view_box',
            field=models.CharField(
                blank=True,
                default='0 0 100 100',
                max_length=50,
                help_text="SVG viewBox for svg_path, reflecting the route's true aspect ratio.",
            ),
        ),
    ]
