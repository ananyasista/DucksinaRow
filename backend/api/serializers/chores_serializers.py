from rest_framework import serializers
from django.utils import timezone
from .models import Chore

class ChoreListSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assigned_roommate.name', read_only=True)

    class Meta:
        model = Chore
        fields = [
            'id',
            'title',
            'completed',
            'due_date',
            'assignee_name'
        ]

class ChoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chore
        fields = "__all__"
        read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        household = data.get("household")

        # Ensures chore belongs to the user's household
        if household != user.household:
            raise serializers.ValidationError(
                "You cannot create chores for another household."
            )
        
        # Ensures assigned roommated belongs to same household
        assigned = data.get("assigned_roommate")
        if assigned and assigned.household != user.household:
                raise serializers.ValidationError(
                    "Assigned roommate must belong to your household."
                )
        
        # Rotation Logic
        if data.get("is_rotating") and not data.get("roommates_involved"):
            raise serializers.ValidationError(
                "Rotating chores must include roommates."
            )

        # Notification Logic
        if data.get("notification_unit") and not data.get("notification_value"):
            raise serializers.ValidationError(
                "Notification value required if unit is set."
            )

        return data

    def update(self, instance, validated_data):
        # Handles updating chores
        was_complete = instance.completed
        instance = super().update(instance, validated_data)

        # was complete
        if not was_complete and instance.completed:
                # Rotate only if deadline has passed
                if instance.date <= timezone.now().date():
                    instance.rotate()
        
        return instance