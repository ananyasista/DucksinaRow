from rest_framework import serializers
from django.utils import timezone
from ..models import Chores

class ChoreListSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assigned_roommate.name', read_only=True)

    class Meta:
        model = Chores
        fields = [
            'id',
            'household',
            'title',
            'completed',
            'date',
            'assignee_name'
        ]

class ChoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chores
        fields = "__all__"
        read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        
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