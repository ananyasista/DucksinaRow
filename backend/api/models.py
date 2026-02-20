import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class RepeatChoices(models.TextChoices):
    NONE = "none", "None"
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"
    MONTHLY = "monthly", "Monthly"


class NotificationUnitChoices(models.TextChoices):
    MINUTES = "minutes", "Minutes"
    HOURS = "hours", "Hours"
    DAYS = "days", "Days"
    WEEKS = "weeks", "Weeks"

# Household Table
class Household(models.Model):
    # unique code for the household
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    household_name = models.CharField(max_length=255)

    join_code = models.CharField(
        max_length=5,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Za-z0-9]{5}$",
                message="Join code must be 5 alphanumeric characters."
            )
        ]
    )

    def __str__(self):
        return self.household_name
    

# User Table
class User(AbstractUser):
    # first and last name already defined in AbstractUser

    # unique user id
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(unique=True)


    household = models.ForeignKey(
        Household,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members"
    )

    # Use email as login field
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  # username is still required

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


# Living Prefernces Table
class LivingPreferences(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="living_preferences"
    )

    cleanliness = models.IntegerField(null=True, blank=True)
    clean_up_your_space = models.BooleanField(default=False)
    cook = models.BooleanField(default=False)
    sharing_items = models.BooleanField(default=True)
    pets = models.BooleanField(default=False)
    guests = models.BooleanField(default=True)
    personality_type = models.CharField(max_length=50, blank=True)
    sleep_schedule = models.CharField(max_length=50, blank=True)
    smoking = models.BooleanField(default=False)
    drinking_alcohol = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Preferences"

# Notifications Preferences Table
class NotificationPreferences(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="notification_settings"
    )

    enabled_push_notifications = models.BooleanField(default=True)
    enable_email_notifications = models.BooleanField(default=True)

    calendar_event_notification_on = models.BooleanField(default=True)
    calendar_event_notification_value = models.IntegerField(null=True, blank=True)
    calendar_event_notification_unit = models.CharField(
        max_length=10,
        choices=NotificationUnitChoices.choices,
        null=True,
        blank=True
    )

    roommate_event_approval_needed_notification_on = models.BooleanField(default=True)

    chore_due_notification_on = models.BooleanField(default=True)
    chore_due_notification_value = models.IntegerField(null=True, blank=True)
    chore_due_notification_unit = models.CharField(
        max_length=10,
        choices=NotificationUnitChoices.choices,
        null=True,
        blank=True
    )

    new_chore_notification_on = models.BooleanField(default=True)
    item_restock_notification_on = models.BooleanField(default=True)
    new_roommate_joined_notification_on = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} Notification Settings"

# Items Table
class Items(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="items"
    )

    name = models.CharField(max_length=255)
    details = models.TextField(blank=True)

    created_date = models.DateField(auto_now_add=True)
    last_purchased_date = models.DateField(null=True, blank=True)

    last_purchased_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items_purchased"
    )

    restock_needed = models.BooleanField(default=False)

    location = models.CharField(max_length=255, blank=True)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return self.name

# Chores Table
class Chores(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="chores"
    )

    title = models.CharField(max_length=255)
    details = models.TextField(blank=True)

    all_day = models.BooleanField(default=False)
    date = models.DateField()

    repeat = models.CharField(
        max_length=20,
        choices=RepeatChoices.choices,
        default=RepeatChoices.NONE
    )

    assigned_roommate = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="assigned_chores"
    )

    next_assignee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="next_rotations"
    )

    is_rotating = models.BooleanField(default=False)

    roommates_involved = models.ManyToManyField(
        User,
        blank=True,
        related_name="chores_involved"
    )

    location = models.CharField(max_length=255, blank=True)

    notification_value = models.IntegerField(null=True, blank=True)
    notification_unit = models.CharField(
        max_length=10,
        choices=NotificationUnitChoices.choices,
        null=True,
        blank=True
    )

    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    

# Calendar Events Table
class CalendarEvents(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="calendar_events"
    )

    title = models.CharField(max_length=255)
    details = models.TextField(blank=True)

    all_day = models.BooleanField(default=False)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    repeat = models.CharField(
        max_length=20,
        choices=RepeatChoices.choices,
        default=RepeatChoices.NONE
    )

    requires_approval = models.BooleanField(default=False)

    location = models.CharField(max_length=255, blank=True)

    event_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_events"
    )

    notification_value = models.IntegerField(null=True, blank=True)
    notification_unit = models.CharField(
        max_length=10,
        choices=NotificationUnitChoices.choices,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title

# Event Approval Table
class EventApprovals(models.Model):
    event = models.ForeignKey(
        CalendarEvents,
        on_delete=models.CASCADE,
        related_name="approvals"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="event_approvals"
    )

    approved = models.BooleanField(default=False)
    response_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("event", "user")

    def clean(self):
        if self.user == self.event.event_owner:
            from django.core.exceptions import ValidationError
            raise ValidationError("Owner cannot approve their own event.")
