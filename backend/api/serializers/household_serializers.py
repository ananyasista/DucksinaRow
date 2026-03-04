from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.serializers.preferences_serializers import LivingPreferencesSerializer

User = get_user_model()

class RoommateSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    living_preferences = LivingPreferencesSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "full_name", "email", "living_preferences")

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else (obj.username or obj.email)