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

        # Validate event dates
        def validate(self, data):
            start = data.get("start_date")
            end = data.get("end_date")

            if start and end and start > end:
                raise serializers.ValidationError("Start date must be before end date.")

            return data

class EventApprovalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventApprovals
        fields = "__all__"

    def validate(self, data):
        event = data.get("event")
        user = data.get("user")

        # Only check on create
        if self.instance is None and event and user:
            if EventApprovals.objects.filter(event=event, user=user).exists():
                raise serializers.ValidationError("Approval already exists for this user and event.")

        return data