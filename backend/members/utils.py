import csv
from datetime import timezone, datetime
from .models import Member, Section, StravaAuth

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
                    'first_name': row['first name'].strip(),
                    'last_name': row['last name'].strip(),
                    'section': section,
                    'year': int(row['year'])
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
            
            new_expires = datetime.fromtimestamp(int(row['token expires'].strip()), tz=timezone.utc)
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