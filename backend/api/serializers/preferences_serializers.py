# api/serialize/preferences_serializers.py
from rest_framework import serializers
from api.models import LivingPreferences

class LivingPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivingPreferences
        fields = "__all__"
        read_only_fields = ("user",)