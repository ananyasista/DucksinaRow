from rest_framework import serializers
from api.models import CalendarEvents, EventApprovals, LivingPreferences 

class CalendarEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvents
        fields = "__all__"
        read_only_fields = ("household", "event_owner") 

    def validate(self, data):
        start = data.get("start_date")
        end = data.get("end_date")

        if self.instance:
            start = start if start is not None else self.instance.start_date
            end = end if end is not None else self.instance.end_date

        if start and end and start > end:
            raise serializers.ValidationError("Start date must be before end date.")

        return data


class EventApprovalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventApprovals
        fields = "__all__"
        read_only_fields = ("user", "response_time") 

    def validate(self, data):
        event = data.get("event")
        user = data.get("user")

        # On create: prevent duplicates
        if self.instance is None and event and user:
            if EventApprovals.objects.filter(event=event, user=user).exists():
                raise serializers.ValidationError("Approval already exists for this user and event.")
        return data