from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import (
    Household,
    User,
    LivingPreferences,
    NotificationPreferences,
    Items,
    Chore,
    ChoreAssignment,
    CalendarEvents,
    EventApprovals
)

User = get_user_model()

admin.site.site_header = "Roommate Manager Admin"
admin.site.site_title = "Roommate Manager"
admin.site.index_title = "Database Dashboard"

@admin.register(User)
class UserAdmin(DjangoUserAdmin):

    # Show join code
    @admin.display(description="Household Code")
    def household_code(self, obj):
        return obj.household.join_code if obj.household else ""

    # Show household name
    @admin.display(description="Household Name")
    def household_name(self, obj):
        return obj.household.household_name if obj.household else ""

    list_display = (
        "household_code",
        "household_name",
        "id",
        "email",
        "first_name",
        "last_name",
        "is_staff"
    )

    ordering = ("household__join_code",)

    search_fields = (
        "email",
        "first_name",
        "last_name",
        "household__join_code",
        "household__household_name"
    )

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Household", {"fields": ("household",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "household",
                "email",
                "username",
                "first_name",
                "last_name",
                "password1",
                "password2",
            ),
        }),
    )

@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ("household_name", "join_code", "id", "get_roommates")
    search_fields = ("household_name", "join_code")

     # Custom method to show roommates
    def get_roommates(self, obj):
        return ", ".join([user.email for user in obj.members.all()])
    
    get_roommates.short_description = "Roommates"

@admin.register(LivingPreferences)
class LivingPreferencesAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "cleanliness",
        "cook",
        "sharing_items",
        "pets",
        "guests",
        "smoking",
        "drinking_alcohol"
    )

@admin.register(NotificationPreferences)
class NotificationPreferencesAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "enabled_push_notifications",
        "enable_email_notifications",
        "chore_due_notification_on",
        "new_chore_notification_on"
    )

@admin.register(Items)
class ItemsAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "household",
        "quantity",
        "restock_needed",
        "location",
        "last_purchased_by"
    )

    list_filter = ("household", "restock_needed")
    search_fields = ("name", "location")

class ChoreAssignmentInline(admin.TabularInline):
    model = ChoreAssignment
    extra = 0  # do not show empty rows
    fields = ("assignee", "due_date", "completed", "all_day")
    readonly_fields = ()
    ordering = ("due_date",)

@admin.register(Chore)
class ChoreAdmin(admin.ModelAdmin):
    list_display = ("title", "household", "repeat", "is_rotating", "location")
    search_fields = ("title", "location", "household__household_name")
    list_filter = ("repeat", "is_rotating", "location")
    inlines = [ChoreAssignmentInline]  # optional, see assignments inline
    filter_horizontal = ("roommates_involved",)

@admin.register(ChoreAssignment)
class ChoreAssignmentAdmin(admin.ModelAdmin):
    list_display = ("chore", "assignee", "due_date", "completed", "all_day")
    list_filter = ("completed", "due_date", "all_day", "chore__household")
    search_fields = ("chore__title", "assignee__first_name", "assignee__last_name")
    ordering = ("due_date",)

class EventApprovalInline(admin.TabularInline):
    """
    Show approval rows directly inside a calendar event detail page.
    This makes it easy to inspect roommate responses for one event.
    """
    model = EventApprovals
    extra = 0
    readonly_fields = ("user", "approved", "response_time")


@admin.register(CalendarEvents)
class CalendarEventsAdmin(admin.ModelAdmin):
    @admin.display(description="Household Code", ordering="household__join_code")
    def household_code(self, obj):
        return obj.household.join_code if obj.household else ""

    list_display = (
        "household_code",
        "title",
        "event_owner",
        "start_date",
        "end_date",
        "requires_approval",
        "approval_summary",
    )
    list_filter = (
        "household",
        "requires_approval",
        "all_day",
        "repeat",
    )
    search_fields = (
        "title",
        "details",
        "location",
        "event_owner__email",
        "household__join_code",
    )
    ordering = ("household__join_code", "start_date")
    inlines = [EventApprovalInline]

    def approval_summary(self, obj):
        approvals = obj.approvals.all()

        if not obj.requires_approval:
            return "approved"

        if not approvals.exists():
            return "pending"

        if approvals.filter(approved=False, response_time__isnull=False).exists():
            return "declined"

        if approvals.filter(approved=False, response_time__isnull=True).exists():
            return "pending"

        return "approved"

    approval_summary.short_description = "Approval Status"


@admin.register(EventApprovals)
class EventApprovalsAdmin(admin.ModelAdmin):
    @admin.display(description="Household Code", ordering="event__household__join_code")
    def household_code(self, obj):
        return obj.event.household.join_code if obj.event and obj.event.household else ""

    list_display = (
        "household_code",
        "event",
        "user",
        "approval_state",
        "response_time",
    )
    list_filter = (
        "approved",
        "event__household",
    )
    search_fields = (
        "event__title",
        "user__email",
        "event__household__join_code",
    )
    ordering = ("event__household__join_code", "event__start_date")

    def approval_state(self, obj):
        if obj.approved:
            return "approved"
        if obj.response_time is None:
            return "pending"
        return "declined"

    approval_state.short_description = "Status"