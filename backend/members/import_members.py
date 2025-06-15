import csv
from .models import Member, Section

def import_members_from_csv(csv_path):
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            section_name = row['section']
            section_obj, _ = Section.objects.get_or_create(name=section_name)

            Member.objects.create(
                first_name=row['first name'].strip(),
                last_name=row['last name'].strip(),
                section=section_obj,
                year=int(row['year']),
                email=row['email'].strip()
            )