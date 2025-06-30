import csv
from members.models import Member

INPUT_CSV = "athletes.csv"

def find_matching_member(strava_name, matched_member_ids):
    strava_name_lower = strava_name.lower()
    for member in Member.objects.all():
        if member.id in matched_member_ids:
            continue
        if member.roster_name.lower() in strava_name_lower:
            matched_member_ids.add(member.id)
            return member
    return None

def check_strava_ids():
    matched_member_ids = set()
    matched_auth_ids = set()

    no_match = []
    no_auth = []
    mismatched = []

    with open(INPUT_CSV, newline='') as infile:
        reader = csv.DictReader(infile)

        for row in reader:
            name = row['name']
            club_strava_id = row['id'].strip()

            member = find_matching_member(name, matched_member_ids)

            if not member:
                no_match.append(name)
                continue

            if hasattr(member, 'strava_auth'):
                matched_auth_ids.add(member.id)
                member_strava_id = str(member.strava_auth.strava_id)
                if member_strava_id != club_strava_id:
                    mismatched.append((member.roster_name, club_strava_id, member_strava_id))
            else:
                no_auth.append(member.roster_name)

    unmatched_auths = Member.objects.filter(strava_auth__isnull=False).exclude(id__in=matched_auth_ids)

    print("\n=== [NO MATCH FOUND] ===")
    for name in no_match:
        print(name)

    print("\n=== [MATCH FOUND, BUT NO STRAVA AUTH] ===")
    for name in no_auth:
        print(name)

    print("\n=== [STRAVA ID MISMATCH] ===")
    for name, club_id, db_id in mismatched:
        print(f"{name}: Club ID = {club_id}, DB ID = {db_id}")

    print("\n=== [UNMATCHED DB AUTHS] ===")
    for member in unmatched_auths:
        print(f"{member.roster_name} (Strava ID: {member.strava_auth.strava_id})")

check_strava_ids()
