from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

User = get_user_model()

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # What columns show in the Users list
    list_display = ("id", "household", "first_name", "last_name", "email", "password")
    ordering = ("email",)
    search_fields = ("email", "first_name", "last_name")

    # Make admin use email as the login/identifier
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Household", {"fields": ("household",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "first_name", "last_name", "household", "password1", "password2"),
        }),
    )