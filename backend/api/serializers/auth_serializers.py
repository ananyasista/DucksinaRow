import uuid
import string
import secrets

from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers

from api.models import Household

User = get_user_model()

def generate_join_code(length=5):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_unique_join_code():
    while True:
        code = generate_join_code()
        if not Household.objects.filter(join_code=code).exists():
            return code

def assign_household_color(user, household):
    palette = [
        "#CF7041",
        "#E5C5BD",
        "#E2A55E",
        "#5E718B",
        "#96AA9A",
        "#B4BFC5",
    ]

    used_colors = set(
        household.members.exclude(display_color__isnull=True)
        .exclude(id=user.id)
        .values_list("display_color", flat=True)
    )

    for color in palette:
        if color not in used_colors:
            user.household = household
            user.display_color = color
            user.save(update_fields=["household", "display_color"])
            return

    fallback_color = palette[len(used_colors) % len(palette)]
    user.household = household
    user.display_color = fallback_color
    user.save(update_fields=["household", "display_color"])

# Validates input and creates user
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    join_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "password", "join_code")

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        validated_data["email"] = email
        validated_data["username"] = email

        join_code = validated_data.pop("join_code", "").strip()
        password = validated_data.pop("password")

        household = None

        if join_code:
            household = Household.objects.filter(join_code__iexact=join_code).first()
            if not household:
                raise serializers.ValidationError(
                    {"join_code": "No household found with this code."}
                )

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if household:
            assign_household_color(user, household)

        return user

# Display user profile information
class ProfileSerializer(serializers.ModelSerializer):
    household_join_code = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "household_join_code", "display_color")

    def get_household_join_code(self, obj):
        return obj.household.join_code if obj.household else None

# Display roommate profile information
class RoommateProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "household_join_code", "display_color")

# Allow user to edit profile
class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")

    def validate_email(self, value):
        value = value.strip().lower()
        # if user is changing email, ensure unique
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

# Allow user to change password
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)