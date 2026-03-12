from rest_framework import serializers
from api.models import Household
from django.contrib.auth import get_user_model
from api.serializers.preferences_serializers import LivingPreferencesSerializer
from api.serializers.auth_serializers import generate_unique_join_code 

User = get_user_model()

class RoommateSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    living_preferences = LivingPreferencesSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "full_name", "first_name", "last_name", "email", "living_preferences")

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else (obj.username or obj.email)

class HouseholdSerializer(serializers.ModelSerializer):
    roommates = RoommateSerializer(source="members", many=True, read_only=True)

    class Meta:
        model = Household
        fields = ("id", "household_name", "join_code", "roommates")


class CreateHouseholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Household
        fields = ["household_name"]

    def create(self, validated_data):
        user = self.context["request"].user

        if user.household is not None:
            raise serializers.ValidationError(
                {"household": "User already belongs to a household."}
            )

        household = Household.objects.create(
            household_name=validated_data["household_name"],
            join_code=generate_unique_join_code(),
        )

        user.household = household
        user.save()

        return household