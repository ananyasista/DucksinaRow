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
    
    # Admin column to show the 5-char join code
    @admin.display(description="Household Code")
    def household_code(self, obj):
        return obj.household.join_code if obj.household else ""

    list_display = ("household_code", "email", "first_name", "last_name", "is_staff")
    ordering = ("household__join_code",)
    search_fields = ("email", "first_name", "last_name", "household__join_code")

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Household", {"fields": ("household",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("household", "email", "username", "first_name", "last_name", "password1", "password2"),
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

@admin.register(CalendarEvents)
class CalendarEventsAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "household",
        "event_owner",
        "start_date",
        "end_date",
        "requires_approval"
    )

    list_filter = ("requires_approval", "household")
    search_fields = ("title", "location")

@admin.register(EventApprovals)
class EventApprovalsAdmin(admin.ModelAdmin):
    list_display = (
        "event",
        "user",
        "get_household",
        "approved",
        "response_time"
    )

    list_filter = ("approved",)
    search_fields = ("event__title", "user__email")

    # Custom method to show household
    def get_household(self, obj):
        return obj.event.household.household_name if obj.event and obj.event.household else "-"
    
    get_household.short_description = "Household"

