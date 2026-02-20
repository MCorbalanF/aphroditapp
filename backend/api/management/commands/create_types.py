from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import RelationshipType


class Command(BaseCommand):
    help = "Create default relationship types"

    DEFAULT_TYPES = [
        {
            "name": "couple",
            "icon": "💑",
            "description": "Romantic relationship"
        },
        {
            "name": "friends",
            "icon": "👫",
            "description": "Friendship relationship"
        },
        {
            "name": "family",
            "icon": "👨‍👩‍👧",
            "description": "Family relationship"
        },
        {
            "name": "buddy",
            "icon": "🤝",
            "description": "Casual buddy relationship"
        },
    ]

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for data in self.DEFAULT_TYPES:
            obj, created = RelationshipType.objects.get_or_create(
                name=data["name"],
                defaults={
                    "icon": data["icon"],
                    "description": data["description"],
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created: {obj.name}')
                )
            else:
                existing_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Already exists: {obj.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nFinished. Created: {created_count}, Existing: {existing_count}"
            )
        )
