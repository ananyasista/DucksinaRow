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

# Validates input and creates user
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    join_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "password", "join_code")

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]  # use email as username
        join_code = validated_data.pop("join_code", "").strip()
        password = validated_data.pop("password")

        # If user entered a join code → join existing
        if join_code:
            household = Household.objects.filter(join_code__iexact=join_code).first()
            if not household:
                raise serializers.ValidationError(
                    {"join_code": "No household found with this code."}
                )

        # If blank → create new household
        else:
            new_code = generate_unique_join_code()
            household = Household.objects.create(
                household_name=f"{validated_data.get('username')}'s Household",
                join_code=new_code
            )

        # Validates password & hides
        user = User(**validated_data)
        user.household = household
        user.set_password(password)   # hashes password
        user.save()
        return user

class MeSerializer(serializers.ModelSerializer):
    household_join_code = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "household_join_code")

    def get_household_join_code(self, obj):
        return obj.household.join_code if obj.household else None