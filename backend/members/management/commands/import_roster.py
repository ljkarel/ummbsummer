import os

from django.core.management.base import BaseCommand

from members.utils import import_roster

DEFAULT_CSV = os.path.join(os.path.dirname(__file__), 'test_roster.csv')


class Command(BaseCommand):
    help = 'Import or update members from a CSV roster file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv',
            default=DEFAULT_CSV,
            help='Path to the roster CSV (default: test_roster.csv in this directory)',
        )

    def handle(self, *args, **options):
        import_roster(options['csv'])
        self.stdout.write(self.style.SUCCESS('Roster import complete.'))
