import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from api.models import (
    Household,
    User,
    LivingPreferences,
    NotificationPreferences,
    Items,
    Chore,
    ChoreAssignment,
    CalendarEvents,
    EventApprovals,
    NotificationUnitChoices,
    RepeatChoices,
    LocationChoices,
    PassToUnitChoices
)

class Command(BaseCommand):
    help = "Create dummy data for testing"

    def handle(self, *args, **options):
        self.stdout.write("Deleting previous test data...")
        EventApprovals.objects.all().delete()
        CalendarEvents.objects.all().delete()
        Chore.objects.all().delete()
        Items.objects.all().delete()
        Household.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        self.stdout.write(self.style.SUCCESS("Old test data deleted!"))

        # --- Create Households ---
        households = []
        for name, code in [("Area 52", "A1B2C"), ("Area 52 Test", "X9Y8Z")]:
            hh, created = Household.objects.get_or_create(
                join_code=code,
                defaults={"household_name": name}
            )
            households.append(hh)
            self.stdout.write(self.style.SUCCESS(f"Created HouseHold: {hh.join_code}"))

        # --- Create Users ---
        first_names = ["Sofia", "Leyna", "Ananya", "Elle"]
        last_names = ["Lynch", "Huynh", "Sista", "Strauss"]

        users = []
        color_palette = [
        "#CF7041",
        "#E5C5BD",
        "#E2A55E",
        "#5E718B",
        "#96AA9A",
        "#B4BFC5",
        ]
        for i in range(4):
            user, created = User.objects.get_or_create(
                email=f"{first_names[i].lower()}@example.com",
                defaults={
                    "first_name": first_names[i],
                    "last_name": last_names[i],
                    "username": f"user{i+1}",
                    "password": make_password("password123"),
                    "household": households[0],
                    "display_color": color_palette[i % len(color_palette)],
                }
            )

            # If user already existed, ensure they get a color
            if not user.display_color:
                user.display_color = color_palette[i % len(color_palette)]
                user.save()

            users.append(user)
            self.stdout.write(self.style.SUCCESS(f"Created user: {user.email} with color {user.display_color}"))

        # --- Create Living Preferences ---
        for user in users:
            LivingPreferences.objects.get_or_create(
                user=user,
                cleanliness=random.randint(1, 10),
                clean_up_your_space=random.choice([True, False]),
                cook=random.choice([True, False]),
                sharing_items=random.choice([True, False]),
                pets=random.choice([True, False]),
                guests=random.choice([True, False]),
                personality_type=random.choice(["Introvert", "Extrovert", "Ambivert"]),
                sleep_schedule=random.choice(["Early Bird", "Night Owl", "Dependent on Schedule"]),
                smoking=random.choice([True, False]),
                drinking_alcohol=random.choice([True, False])
            )

        # --- Create Notification Preferences ---
        for user in users:
            NotificationPreferences.objects.get_or_create(
                user=user,
                enabled_push_notifications=True,
                enable_email_notifications=True,
                calendar_event_notification_on=True,
                calendar_event_notification_value=random.randint(5, 60),
                calendar_event_notification_unit=random.choice([u[0] for u in NotificationUnitChoices.choices]),
                chore_due_notification_on=True,
                chore_due_notification_value=random.randint(1, 24),
                chore_due_notification_unit=random.choice([u[0] for u in NotificationUnitChoices.choices]),
            )

        # --- Create Items ---
        for hh in households:
            members = list(hh.members.all())
            if not members:
                self.stdout.write(self.style.WARNING(f"No members in household {hh.household_name}, skipping events"))
                continue
            for item_name in ["Milk", "Eggs", "Bread", "Soap"]:
                Items.objects.get_or_create(
                    household=hh,
                    name=item_name,
                    details=f"{item_name} for {hh.household_name}",
                    last_purchased_date=timezone.now() - timedelta(days=random.randint(0, 5)),
                    last_purchased_by=random.choice(users),
                    restock_needed=random.choice([True, False]),
                    location="Kitchen",
                    quantity=random.randint(1, 10)
                )
            self.stdout.write(self.style.SUCCESS(f"Created item: {item_name}"))

        # --- Create Chores ---
        for hh in households:
            members = list(hh.members.all())
            if not members:
                self.stdout.write(self.style.WARNING(f"No members in household {hh.household_name}, skipping events"))
                continue
            for chore_name in ["Vacuum", "Dishes", "Laundry"]:
                # Create the chore definition
                is_rotating = random.choice([True, False])
                is_all_day = random.choice([True, False])
                chore, created = Chore.objects.get_or_create(
                    household=hh,
                    title=chore_name,
                    details=f"{chore_name} for {hh.household_name}",
                    repeat_unit=random.choice([r[0] for r in RepeatChoices.choices]),
                    repeat_value=random.randint(1, 7),
                    is_rotating=is_rotating,
                    pass_to_next_value=random.randint(1, 5) if is_rotating else 0,
                    pass_to_next_unit=random.choice([u[0] for u in PassToUnitChoices.choices[1:]]) if is_rotating else "none",
                    location=random.choice([u[0] for u in LocationChoices.choices]),
                    notification_value=random.randint(5, 60),
                    notification_unit=random.choice([u[0] for u in NotificationUnitChoices.choices]),
                )

                # Add roommates involved for rotation
                # Add roommates involved for rotation
                if chore.is_rotating:
                    roommates_for_chore = random.sample(members, k=min(2, len(members)))
                else:
                    roommates_for_chore = random.sample(members, k=1)
                chore.roommates_involved.set(roommates_for_chore)
                chore.save()  # make sure the M2M is saved before creating assignment

                # Create the first assignment
                initial_assignee = random.choice(roommates_for_chore)
                next_assignee = None
                if chore.is_rotating and len(roommates_for_chore) > 1:
                    # pick someone else as next
                    next_assignee = random.choice([u for u in roommates_for_chore if u != initial_assignee])

                due_date = timezone.now().date() + timedelta(days=random.randint(0, 7))
                ChoreAssignment.objects.create(
                    chore=chore,
                    assignee=initial_assignee,
                    next_assignee=next_assignee,
                    due_date=due_date,
                    all_day=is_all_day,
                    completed=False
                )
                self.stdout.write(self.style.SUCCESS(f"Created chore: {chore.title}"))


        # --- Create Calendar Events ---
        for hh in households:
            members = list(hh.members.all())
            if not members:
                self.stdout.write(self.style.WARNING(f"No members in household {hh.household_name}, skipping events"))
                continue

            for event_name in ["House Meeting", "Dinner Party"]:
                owner = random.choice(members)  # pick from household members

                # create the event
                event = CalendarEvents.objects.create(
                    household=hh,
                    title=event_name,
                    details=f"{event_name} at {hh.household_name}",
                    all_day=False,
                    start_date=timezone.now() + timedelta(days=random.randint(0,5)),
                    end_date=timezone.now() + timedelta(days=random.randint(0,5), hours=2),
                    repeat=random.choice([r[0] for r in RepeatChoices.choices]),
                    requires_approval=random.choice([True, False]),
                    location="Common Room",
                    event_owner=owner,
                    notification_value=random.randint(5, 60),
                    notification_unit=random.choice([u[0] for u in NotificationUnitChoices.choices])
                )

                # Create approvals if required
                if event.requires_approval:
                    for member in members:
                        if member.id == owner.id:
                            continue
                        EventApprovals.objects.create(
                            event=event,
                            user=member,
                            approved=random.choice([True, False]),
                            response_time=timezone.now()
                        )
                        self.stdout.write(self.style.SUCCESS(f"Created event approval: {event.title} for {member.first_name}"))

                self.stdout.write(self.style.SUCCESS(f"Created Event: {event.title} (Owner: {owner.first_name})"))

        self.stdout.write(self.style.SUCCESS("Dummy data created successfully!"))