from rest_framework import serializers
from django.utils import timezone
from ..models import Chore, ChoreAssignment


class ChoreAssignmentSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source="assignee.name", read_only=True)
    chore_id = serializers.PrimaryKeyRelatedField(source="chore", read_only=True)

    class Meta:
        model = ChoreAssignment
        fields = ["id", "chore_id", "assignee", "assignee_name", "due_date", "completed", "all_day"]

class ChoreListSerializer(serializers.ModelSerializer):
    latest_assignment = serializers.SerializerMethodField()

    class Meta:
        model = Chore
        fields = [
            "id",
            "household",
            "title",
            "latest_assignment",
        ]

    def get_latest_assignment(self, obj):
        assignment = obj.assignments.order_by("-due_date").first()
        if assignment:
            return ChoreAssignmentSerializer(assignment).data
        return None

class ChoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chore
        fields = "__all__"
        read_only_fields = ("id", "household")

    def get_latest_assignment(self, obj):
        assignment = obj.assignments.order_by("-due_date").first()
        if assignment:
            return ChoreAssignmentSerializer(assignment).data
        return None

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