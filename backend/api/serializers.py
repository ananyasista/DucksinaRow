from rest_framework import serializers
from .models import *


class HouseholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Household
        fields = [
            'id', 
            'household_name', 
            'join_code'
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'household',
            'username',
            'first_name',
            'last_name',
        ]

class LivingPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivingPreferences
        fields = "__all__"


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreferences
        fields = "__all__"

class ItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Items
        fields = "__all__"

class ChoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chores
        fields = "__all__"

class CalendarEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvents
        fields = "__all__"

class EventApprovalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventApprovals
        fields = "__all__"