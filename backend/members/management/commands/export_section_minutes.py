from django.core.management.base import BaseCommand, CommandError

from members.utils import email_section_minutes_csv


class Command(BaseCommand):
    help = "Email a CSV of total minutes per member for a section and competition period."

    def add_arguments(self, parser):
        parser.add_argument('--period', type=int, required=True, help="CompetitionPeriod ID")
        parser.add_argument('--section', type=str, required=True, help="Section slug")
        parser.add_argument('--email', nargs='+', required=True, dest='emails', help="Recipient email address(es)")

    def handle(self, *args, **options):
        period_id = options['period']
        section_slug = options['section']
        emails = options['emails']

        try:
            email_section_minutes_csv(period_id, section_slug, emails)
        except ValueError as e:
            raise CommandError(str(e))

        self.stdout.write(self.style.SUCCESS(
            f"CSV emailed to {', '.join(emails)} for section '{section_slug}', period {period_id}."
        ))
