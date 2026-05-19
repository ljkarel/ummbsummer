import math
import random
from datetime import date, datetime, time, timedelta, timezone

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from faker import Faker

from activities.models import Activity
from activities.utils import polyline_to_svg_path
from art.models import ArtLike, ArtSubmission, ArtWeek
from members.models import Member, Section, StravaAuth
from metrics.models import Competition, CompetitionPeriod, SectionPeriodScore
from metrics.utils import (
    freeze_section_period_scores,
    get_period_for_datetime,
)

import polyline as polyline_lib

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECTIONS = [
    ("Flute",           21),
    ("Clarinet",        31),
    ("Tenor Saxophone", 18),
    ("Drumline",        30),
    ("Trumpet",         64),
    ("DMT",              4),
    ("Trombone",        41),
    ("Color Guard",     26),
    ("Mellophone",      23),
    ("Baritone",        22),
    ("Sousaphone",      18),
    ("Alto Saxophone",  33),
]

PERIOD_DATES = [
    # (name, start_date, end_date, freeze_datetime_utc)
    ("Week 1",  date(2026, 5,  4), date(2026, 5, 10), datetime(2026,  5, 11, 4, 59, tzinfo=timezone.utc)),
    ("Week 2",  date(2026, 5, 11), date(2026, 5, 17), datetime(2026,  5, 18, 4, 59, tzinfo=timezone.utc)),
    ("Week 3",  date(2026, 5, 18), date(2026, 5, 24), datetime(2026,  5, 25, 4, 59, tzinfo=timezone.utc)),
    ("Week 4",  date(2026, 5, 25), date(2026, 5, 31), datetime(2026,  6,  1, 4, 59, tzinfo=timezone.utc)),
    ("Week 5",  date(2026, 6,  1), date(2026, 6,  7), datetime(2026,  6,  8, 4, 59, tzinfo=timezone.utc)),
    ("Week 6",  date(2026, 6,  8), date(2026, 6, 14), datetime(2026,  6, 15, 4, 59, tzinfo=timezone.utc)),
    ("Week 7",  date(2026, 6, 15), date(2026, 6, 21), datetime(2026,  6, 22, 4, 59, tzinfo=timezone.utc)),
    ("Week 8",  date(2026, 6, 22), date(2026, 6, 28), datetime(2026,  6, 29, 4, 59, tzinfo=timezone.utc)),
    ("Week 9",  date(2026, 6, 29), date(2026, 7,  5), datetime(2026,  7,  6, 4, 59, tzinfo=timezone.utc)),
    ("Week 10", date(2026, 7,  6), date(2026, 7, 12), datetime(2026,  7, 13, 4, 59, tzinfo=timezone.utc)),
    ("Week 11", date(2026, 7, 13), date(2026, 7, 19), datetime(2026,  7, 20, 4, 59, tzinfo=timezone.utc)),
    ("Week 12", date(2026, 7, 20), date(2026, 7, 26), datetime(2026,  7, 27, 4, 59, tzinfo=timezone.utc)),
]

ART_THEMES = {
    "Week 1": "Loop",
    "Week 2": "Letter U",
    "Week 3": "Letter M",
}

SPORT_TYPES = [
    ("Run",          True,  6.0),   # has distance, ~6 min/mile
    ("Ride",         True,  3.0),   # has distance, ~3 min/mile
    ("Walk",         True,  15.0),  # has distance, ~15 min/mile
    ("Swim",         False, 0.0),
    ("WeightTraining", False, 0.0),
]

YEAR_WEIGHTS = [35, 25, 20, 15, 5]  # Rookie through 5th Year+

# UMN campus center
CAMPUS_LAT, CAMPUS_LNG = 44.9727, -93.2354


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_fake_polyline(rng, n_points=None):
    """Generate a fake GPS loop near UMN campus, return encoded polyline string."""
    n = n_points or rng.randint(15, 35)
    radius = rng.uniform(0.004, 0.018)
    offset_lat = rng.uniform(-0.015, 0.015)
    offset_lng = rng.uniform(-0.015, 0.015)
    center_lat = CAMPUS_LAT + offset_lat
    center_lng = CAMPUS_LNG + offset_lng

    pts = []
    for i in range(n):
        angle = 2 * math.pi * i / n
        r = radius * (0.6 + 0.4 * rng.random())
        lat = center_lat + r * math.sin(angle)
        lng = center_lng + r * math.cos(angle)
        pts.append((round(lat, 5), round(lng, 5)))
    pts.append(pts[0])  # close loop
    return polyline_lib.encode(pts)


def random_datetime_in_period(rng, period):
    """Return a random timezone-aware datetime within the period, between 6am–9pm."""
    delta = (period.end_date - period.start_date).days
    day = period.start_date + timedelta(days=rng.randint(0, delta))
    hour = rng.randint(6, 21)
    minute = rng.randint(0, 59)
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=timezone.utc)


def unique_email(fake, first, last, existing):
    """Build a UMN email, adding a counter suffix to guarantee uniqueness."""
    base = f"{first.lower().replace(' ', '')}.{last.lower().replace(' ', '')}@umn.edu"
    email = base
    i = 2
    while email in existing:
        email = base.replace("@", f"{i}@")
        i += 1
    existing.add(email)
    return email


# ---------------------------------------------------------------------------
# Flush
# ---------------------------------------------------------------------------

def flush_all(stdout):
    stdout.write("  Flushing art likes...")
    ArtLike.objects.all().delete()
    stdout.write("  Flushing art submissions...")
    ArtSubmission.objects.all().delete()
    stdout.write("  Flushing art weeks...")
    ArtWeek.objects.all().delete()
    stdout.write("  Flushing section period scores...")
    SectionPeriodScore.objects.all().delete()
    stdout.write("  Flushing activities...")
    Activity.objects.all().delete()
    stdout.write("  Flushing Strava auth records...")
    StravaAuth.objects.all().delete()
    stdout.write("  Flushing member-linked users (non-superusers)...")
    User.objects.filter(is_superuser=False).delete()
    stdout.write("  Flushing members...")
    Member.objects.all().delete()
    stdout.write("  Flushing sections...")
    Section.objects.all().delete()
    stdout.write("  Flushing competition periods...")
    CompetitionPeriod.objects.all().delete()
    stdout.write("  Flushing competitions...")
    Competition.objects.all().delete()


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = "Seed the database with realistic mock data for development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing seed data before seeding.",
        )
        parser.add_argument(
            "--random-seed",
            type=int,
            default=42,
            help="Random seed for reproducibility (default: 42).",
        )

    def handle(self, *args, **options):
        rng = random.Random(options["random_seed"])
        fake = Faker()
        fake.seed_instance(options["random_seed"])

        if options["flush"]:
            self.stdout.write("Flushing existing data...")
            flush_all(self.stdout)
            self.stdout.write(self.style.SUCCESS("Flush complete.\n"))

        self.stdout.write("Seeding competition and periods...")
        competition, _ = Competition.objects.get_or_create(
            name="Summer '26",
            defaults={"start_date": date(2026, 5, 4), "end_date": date(2026, 7, 26)},
        )

        periods = {}
        for name, start, end, freeze in PERIOD_DATES:
            period, _ = CompetitionPeriod.objects.get_or_create(
                competition=competition,
                name=name,
                defaults={"start_date": start, "end_date": end, "freeze_datetime": freeze},
            )
            periods[name] = period
        self.stdout.write(f"  {len(periods)} periods ready.")

        self.stdout.write("Seeding sections and members...")
        existing_emails = set(Member.objects.values_list("email", flat=True))
        sections_map = {}

        for section_name, target_count in SECTIONS:
            section, _ = Section.objects.get_or_create(name=section_name)
            sections_map[section_name] = section

            current_count = section.members.count()
            to_create = max(0, target_count - current_count)

            for i in range(to_create):
                first = fake.first_name()
                last = fake.last_name()
                email = unique_email(fake, first, last, existing_emails)
                year = rng.choices(range(1, 6), weights=YEAR_WEIGHTS)[0]
                is_leader = (i == 0 and current_count == 0)
                Member.objects.create(
                    section=section,
                    first_name=first,
                    last_name=last,
                    email=email,
                    year=year,
                    is_leader=is_leader,
                )

        total_members = Member.objects.count()
        self.stdout.write(f"  {total_members} members ready.")

        self.stdout.write("Seeding dev/admin user...")
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={"is_staff": True, "is_superuser": True},
        )
        if not admin_user.is_superuser:
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
        
        if admin_user.email != "karel084@umn.edu":
            admin_user.email = "karel084@umn.edu"
            admin_user.save()

        baritone = sections_map.get("Baritone")
        dev_member, created = Member.objects.get_or_create(
            email="karel084@umn.edu",
            defaults={
                "first_name": "Lukas",
                "last_name": "Karel",
                "section": baritone,
                "year": 5,
                "is_leader": False,
            },
        )
        if dev_member.user != admin_user:
            dev_member.user = admin_user
            dev_member.save()
        
        if not admin_user.is_staff:
            admin_user.is_staff = True
            admin_user.save()

        # if not hasattr(dev_member, "strava_auth"):
        #     StravaAuth.objects.create(
        #         strava_id=9999999999,
        #         member=dev_member,
        #         access_token="fake_dev_token",
        #         refresh_token="fake_dev_refresh",
        #         token_expires=datetime(2030, 1, 1, tzinfo=timezone.utc),
        #         scope="activity:read_all",
        #     )
        self.stdout.write("  Dev user (dev@umn.edu → admin) ready.")

        self.stdout.write("Assigning registration statuses...")
        # Status distribution: 40% connected, 25% pending, 35% unregistered
        base_seed = options["random_seed"]
        all_members = list(Member.objects.exclude(email="dev@umn.edu").select_related("user"))

        for member in all_members:
            if member.user_id is not None:
                continue  # already assigned — skip

            # Use per-member deterministic seed so status is stable across re-runs
            roll = random.Random(member.pk * 9973 + base_seed).random()
            if roll < 0.40:
                # connected: create user + strava auth
                user, _ = User.objects.get_or_create(username=f"member_{member.pk}")
                member.user = user
                member.save(update_fields=["user"])
                StravaAuth.objects.get_or_create(
                    member=member,
                    defaults={
                        "strava_id": 1_000_000_000 + member.pk,
                        "access_token": "fake_token",
                        "refresh_token": "fake_refresh",
                        "token_expires": datetime(2030, 1, 1, tzinfo=timezone.utc),
                        "scope": "activity:read_all",
                    },
                )
            elif roll < 0.65:
                # pending: user but no strava
                user, _ = User.objects.get_or_create(username=f"member_{member.pk}")
                member.user = user
                member.save(update_fields=["user"])
            # else: unregistered — no changes

        connected_count = StravaAuth.objects.count()
        self.stdout.write(f"  {connected_count} members connected, others pending/unregistered.")

        self.stdout.write("Seeding activities (bulk_create — skips Mapbox)...")
        active_periods = [periods[n] for n in ("Week 1", "Week 2", "Week 3")]
        acts_per_period = {
            "Week 1": (2, 5),
            "Week 2": (2, 5),
            "Week 3": (0, 3),
        }

        connected_members = list(
            Member.objects.filter(strava_auth__isnull=False).prefetch_related("activities")
        )

        activity_id_base = 10_000_000_000
        activities_to_create = []
        existing_activity_ids = set(Activity.objects.values_list("activity_id", flat=True))
        # Track which (member, period) combos already have activities so re-runs skip them
        existing_member_periods = set(
            Activity.objects.filter(period__in=active_periods)
            .values_list("member_id", "period_id")
        )

        for member in connected_members:
            for period in active_periods:
                if (member.pk, period.pk) in existing_member_periods:
                    continue  # already seeded this member+period

                # Deterministic per-(member, period) rng so n_acts=0 stays 0 on re-runs
                mp_rng = random.Random(member.pk * 6271 + period.pk * 3137 + base_seed)

                lo, hi = acts_per_period[period.name]
                n_acts = mp_rng.randint(lo, hi)
                for j in range(n_acts):
                    act_rng = random.Random(member.pk * 6271 + period.pk * 3137 + j * 97 + base_seed)
                    sport_name, has_dist, pace = act_rng.choice(SPORT_TYPES)
                    mins = act_rng.choices(
                        range(15, 91),
                        weights=[max(1, 10 - abs(x - 35)) for x in range(15, 91)],
                    )[0]
                    dist = round(mins / pace, 2) if has_dist and pace > 0 else 0.0
                    elev = round(act_rng.uniform(0, 300), 1) if has_dist else 0.0
                    elapsed = mins + act_rng.randint(0, 10)
                    dt = random_datetime_in_period(act_rng, period)

                    encoded_poly = make_fake_polyline(act_rng)
                    svg_path, svg_view_box = polyline_to_svg_path(encoded_poly)

                    activity_id = activity_id_base + member.pk * 10_000 + period.pk * 100 + j
                    if activity_id in existing_activity_ids:
                        continue
                    existing_activity_ids.add(activity_id)

                    activities_to_create.append(Activity(
                        activity_id=activity_id,
                        member=member,
                        name=f"{act_rng.choice(['Morning', 'Afternoon', 'Evening', 'Quick', 'Long'])} {sport_name}",
                        distance=dist,
                        minutes=mins,
                        elapsed_time=elapsed,
                        elevation_gain=elev,
                        sport_type=sport_name,
                        datetime=dt,
                        polyline=encoded_poly,
                        svg_path=svg_path,
                        svg_view_box=svg_view_box,
                        period=period,
                        manual=False,
                        private=False,
                    ))

        Activity.objects.bulk_create(activities_to_create, ignore_conflicts=True)
        self.stdout.write(f"  {len(activities_to_create)} activities created.")

        self.stdout.write("Freezing scores for completed periods...")
        for period_name in ("Week 1", "Week 2"):
            freeze_section_period_scores(periods[period_name])
        self.stdout.write("  Scores frozen for Period 1 and Period 2.")

        self.stdout.write("Seeding art weeks...")
        for period_name, theme in ART_THEMES.items():
            ArtWeek.objects.get_or_create(
                period=periods[period_name],
                defaults={"theme": theme},
            )
        self.stdout.write(f"  {len(ART_THEMES)} art weeks ready.")

        self.stdout.write("Seeding art submissions and likes...")
        visibility_choices = (
            [ArtSubmission.VISIBILITY_PUBLIC] * 7
            + [ArtSubmission.VISIBILITY_ANONYMOUS] * 2
            + [ArtSubmission.VISIBILITY_PRIVATE] * 1
        )

        for period_name in ("Week 1", "Week 2", "Week 3"):
            period = periods[period_name]
            period_members = list(
                Member.objects.filter(
                    strava_auth__isnull=False,
                    activities__period=period,
                ).distinct()
            )
            if not period_members:
                continue

            # Sort by pk so selection is identical on every run
            submitters = sorted(period_members, key=lambda m: m.pk)[:15]
            submitter_pks = {m.pk for m in submitters}
            submissions_this_period = []

            for member in submitters:
                # Deterministic activity selection: earliest in the period
                activity = (
                    member.activities.filter(period=period).order_by("datetime").first()
                )
                if not activity:
                    continue

                # Per-member deterministic rng for title/rotation/visibility
                mem_rng = random.Random(member.pk * 3571 + period.pk * 1009 + base_seed)

                sub, _ = ArtSubmission.objects.get_or_create(
                    member=member,
                    period=period,
                    defaults={
                        "activity": activity,
                        "title": f"{fake.word().capitalize()} {ART_THEMES.get(period_name, 'Art')}",
                        "rotation": mem_rng.choice([0, 45, 90, 135, 180, 225, 270, 315]),
                        "visibility": mem_rng.choice(visibility_choices),
                        "stroke_color": mem_rng.choice(['', '#e54b4b', '#e59c4b', '#f0c94b', '#4dc96b', '#4b8ef0', '#a04be5', '#ffffff']),
                        "bg_color": mem_rng.choice(['', '#0a0a0a', '#2a1f14', '#2b0d14', '#1a1a2e', '#0d2818', '#3d3d3d', '#f8f5f0', '#ffffff', '#dce8f5', '#f5e6d0']),
                        "stroke_width": mem_rng.choice([1.0, 2.8, 5.0, 8.0]),
                        "is_withdrawn": False,
                    },
                )
                submissions_this_period.append(sub)

            # Add likes to public/anonymous submissions
            public_subs = [
                s for s in submissions_this_period
                if s.visibility in (ArtSubmission.VISIBILITY_PUBLIC, ArtSubmission.VISIBILITY_ANONYMOUS)
            ]
            likers = sorted(
                [m for m in period_members if m.pk not in submitter_pks],
                key=lambda m: m.pk,
            )

            for sub in public_subs:
                if not likers:
                    continue
                # Per-submission deterministic rng
                sub_rng = random.Random(sub.pk * 7919 + base_seed)
                n_likes = sub_rng.randint(3, min(20, len(likers)))
                liking_members = sub_rng.sample(likers, n_likes)
                likes_to_create = [ArtLike(submission=sub, member=liker) for liker in liking_members]
                ArtLike.objects.bulk_create(likes_to_create, ignore_conflicts=True)

        sub_count = ArtSubmission.objects.count()
        like_count = ArtLike.objects.count()
        self.stdout.write(f"  {sub_count} submissions, {like_count} likes created.")

        self.stdout.write("Seeding open art submissions...")
        # Pick a deterministic subset of 8 connected members for open submissions
        all_connected = sorted(
            Member.objects.filter(strava_auth__isnull=False),
            key=lambda m: m.pk,
        )
        open_submitters = all_connected[:8]
        # Gather all season activities (any period)
        season_activities = list(
            Activity.objects.filter(member__in=open_submitters, period__isnull=False)
        )
        activity_by_member = {}
        for a in season_activities:
            activity_by_member.setdefault(a.member_id, []).append(a)

        open_visibility_choices = (
            [ArtSubmission.VISIBILITY_PUBLIC] * 6
            + [ArtSubmission.VISIBILITY_ANONYMOUS] * 3
            + [ArtSubmission.VISIBILITY_PRIVATE] * 1
        )

        open_subs_created = []
        for member in open_submitters:
            member_acts = activity_by_member.get(member.pk, [])
            if not member_acts:
                continue
            mem_rng = random.Random(member.pk * 5381 + base_seed + 999)
            n_subs = mem_rng.randint(1, 3)
            for k in range(n_subs):
                sub_rng = random.Random(member.pk * 5381 + k * 113 + base_seed + 999)
                activity = sub_rng.choice(member_acts)
                sub = ArtSubmission.objects.create(
                    member=member,
                    period=None,
                    activity=activity,
                    title=f"{fake.word().capitalize()} {fake.word().capitalize()}",
                    rotation=sub_rng.choice([0, 45, 90, 135, 180, 225, 270, 315]),
                    visibility=sub_rng.choice(open_visibility_choices),
                    stroke_color=sub_rng.choice(['', '#e54b4b', '#e59c4b', '#f0c94b', '#4dc96b', '#4b8ef0', '#a04be5', '#ffffff']),
                    bg_color=sub_rng.choice(['', '#0a0a0a', '#2a1f14', '#2b0d14', '#1a1a2e', '#0d2818', '#3d3d3d', '#f8f5f0', '#ffffff', '#dce8f5', '#f5e6d0']),
                    stroke_width=sub_rng.choice([1.0, 2.8, 5.0, 8.0]),
                )
                open_subs_created.append(sub)

        # Add likes to public/anonymous open submissions
        public_open_subs = [
            s for s in open_subs_created
            if s.visibility in (ArtSubmission.VISIBILITY_PUBLIC, ArtSubmission.VISIBILITY_ANONYMOUS)
        ]
        open_submitter_pks = {m.pk for m in open_submitters}
        potential_likers = sorted(
            Member.objects.filter(strava_auth__isnull=False).exclude(pk__in=open_submitter_pks),
            key=lambda m: m.pk,
        )[:30]
        for sub in public_open_subs:
            sub_rng = random.Random(sub.pk * 6571 + base_seed + 999)
            if not potential_likers:
                break
            n_likes = sub_rng.randint(1, min(10, len(potential_likers)))
            liking_members = sub_rng.sample(potential_likers, n_likes)
            ArtLike.objects.bulk_create(
                [ArtLike(submission=sub, member=liker) for liker in liking_members],
                ignore_conflicts=True,
            )

        self.stdout.write(f"  {len(open_subs_created)} open submissions created.")

        self.stdout.write(self.style.SUCCESS("\nSeed complete!"))
        self.stdout.write(f"  Sections:             {Section.objects.count()}")
        self.stdout.write(f"  Members:              {Member.objects.count()}")
        self.stdout.write(f"  Connected (Strava):   {StravaAuth.objects.count()}")
        self.stdout.write(f"  Activities:           {Activity.objects.count()}")
        self.stdout.write(f"  SectionPeriodScores:  {SectionPeriodScore.objects.count()}")
        self.stdout.write(f"  ArtSubmissions:       {ArtSubmission.objects.count()}")
        self.stdout.write(f"  ArtLikes:             {ArtLike.objects.count()}")
        self.stdout.write(f"\n  Dev login: GET /api/auth/init/ (DEBUG mode auto-logs in as admin)")
