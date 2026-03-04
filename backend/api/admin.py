from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

User = get_user_model()

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