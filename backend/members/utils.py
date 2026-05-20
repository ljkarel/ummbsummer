import csv
from datetime import UTC, datetime, timedelta, timezone

from django.conf import settings as django_settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone as dj_timezone

from .models import Member, Section, StravaAuth


def notify_admins(subject, body):
    User = get_user_model()
    admin_emails = list(User.objects.filter(is_staff=True).values_list('email', flat=True))
    print(f"Admin emails: {admin_emails}")
    if admin_emails:
        print(f"Sending email to admins: {admin_emails}")
        send_mail(subject, body, django_settings.DEFAULT_FROM_EMAIL, admin_emails, fail_silently=False)


def compute_member_streak(member) -> int:
    """Count consecutive days ending today where the member logged at least one activity."""
    dates = set(
        member.activities
        .values_list('datetime__date', flat=True)
    )
    print(dates)
    streak = 0
    day = dj_timezone.localdate()
    if day not in dates:
        print(f"No activity for today ({day}), streak is 0")
        day -= timedelta(days=1)
    while day in dates:
        streak += 1
        day -= timedelta(days=1)
    return streak


def get_active_competition():
    """Return the active competition (contains today), or the nearest upcoming one."""
    from metrics.models import Competition
    today = dj_timezone.now().date()
    return (
        Competition.objects.filter(start_date__lte=today, end_date__gte=today).first()
        or Competition.objects.filter(start_date__gt=today).order_by('start_date').first()
    )


def import_roster(csv_path="./roster.csv"):
    new_members = []
    csv_emails = set()

    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Ensure that the member has a UMN email
            email = row['email'].strip()
            if not email:
                continue
            csv_emails.add(email)

            # Create section with specified name, if it doesn't exist yet
            section_name = row['section'].strip()
            section, _ = Section.objects.get_or_create(name=section_name)

            # If a member with that email exists, update it (as necessary); otherwise, create it
            member, created = Member.objects.update_or_create(
                email=email,
                defaults={
                    'first_name': row['first_name'].strip(),
                    'last_name': row['last_name'].strip(),
                    'section': section,
                    'year': int(row['year']),
                    'is_leader': row.get('is_leader', 'F').strip().upper() == 'T',
                }
            )

            if created:
                new_members.append(member)

    print(f"Created {len(new_members)} member(s):")
    for member in new_members:
        print(member)

    print("\nThe following member(s) did not appear on the roster:")
    for member in Member.objects.exclude(email__in=csv_emails):
        print(member)


def import_tokens(csv_path="./tokens.csv"):
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            email = row['email'].strip()

            try:
                member = Member.objects.get(email=email)
            except Member.DoesNotExist:
                print(f"Skipping: No member with email {email}")
                continue

            new_expires = datetime.fromtimestamp(int(row['token expires'].strip()), tz=UTC)
            try:
                strava_auth = StravaAuth.objects.get(member=member)
                if new_expires > strava_auth.token_expires:
                    strava_auth.strava_id = int(row['strava id'].strip())
                    strava_auth.access_token = row['access token'].strip()
                    strava_auth.refresh_token = row['refresh token'].strip()
                    strava_auth.token_expires = new_expires
                    strava_auth.scope = row['scope'].strip()
                    strava_auth.save()
                    print(f"Updated: {strava_auth}")
                else:
                    print(f"Skipped (newer token already exists): {email}")
            except StravaAuth.DoesNotExist:
                strava_auth = StravaAuth.objects.create(
                    member=member,
                    strava_id=int(row['strava id'].strip()),
                    access_token=row['access token'].strip(),
                    refresh_token=row['refresh token'].strip(),
                    token_expires=new_expires,
                    scope=row['scope'].strip()
                )
                print(f"Created: {strava_auth}")
