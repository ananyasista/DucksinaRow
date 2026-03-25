from rest_framework import serializers
from django.utils import timezone
from ..models import Chore, ChoreAssignment
from .serializers import SimpleUserSerializer, User


class ChoreAssignmentSerializer(serializers.ModelSerializer):
    assignee = SimpleUserSerializer(read_only=True)
    next_assignee = SimpleUserSerializer(read_only=True)
    chore_id = serializers.PrimaryKeyRelatedField(source="chore", read_only=True)
    due_date = serializers.DateTimeField(
        write_only=True,
        required=False,
        input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S.%fZ']
    )

    completed = serializers.BooleanField(required=False) 
    class Meta:
        model = ChoreAssignment
        fields = ["id", "chore_id", "assignee", "next_assignee", "due_date", "completed", "all_day"]

class ChoreSerializer(serializers.ModelSerializer):
    # Nested assignment
    current_assignment = ChoreAssignmentSerializer(source="latest_assignment", read_only=False, required=False)

    # Roommates
    roommates_involved = SimpleUserSerializer(many=True, read_only=True)
    roommates_involved_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        required=False
    )

    # Only for creating/updating due_date of the chore itself
    due_date = serializers.DateTimeField(
        write_only=True,
        required=True,
        input_formats=['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S.%fZ']
    )

    class Meta:
        model = Chore
        fields = "__all__"
        read_only_fields = ("id", "household")

    # Validation
    def validate(self, data):
        user = self.context["request"].user

        # Validate assigned roommate only if present
        assigned = data.get("assigned_roommate")
        if assigned and assigned.household != user.household:
            raise serializers.ValidationError(
                "Assigned roommate must belong to your household."
            )

        # Rotation logic: validate only if field is being updated
        if data.get("is_rotating") and not data.get("roommates_involved") and self.instance is None:
            raise serializers.ValidationError(
                "Rotating chores must include roommates."
            )

        # Pass-to-next logic
        if "pass_to_next_unit" in data and data.get("pass_to_next_unit"):
            if "pass_to_next_value" not in data or not data.get("pass_to_next_value"):
                raise serializers.ValidationError(
                    "pass_to_next_value required if unit is set."
                )

        # Notification logic
        if "notification_unit" in data and data.get("notification_unit"):
            if "notification_value" not in data or not data.get("notification_value"):
                raise serializers.ValidationError(
                    "Notification value required if unit is set."
                )

        return data

    # Create method
    def create(self, validated_data):
        roommates = validated_data.pop("roommates_involved_ids", [])
        if not roommates:
            raise serializers.ValidationError("Must have roommates involved")

        due_date = validated_data.pop("due_date")
        if validated_data.get("all_day", True):
            due_date = due_date.date()

        # Create chore
        chore = Chore.objects.create(**validated_data)
        chore.roommates_involved.set(roommates)

        # Determine first assignee & next assignee
        assignee = roommates[0]
        next_assignee = roommates[1] if len(roommates) > 1 else None

        # Create first assignment
        ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=due_date,
            completed=False,
            all_day=validated_data.get("all_day", True),
        )

        return chore

    # Update method (handles nested assignment)
    def update(self, instance, validated_data):
        assignment_data = validated_data.pop("latest_assignment", None)

        # Update chore fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update the latest assignment
        if assignment_data:
            assignment = instance.latest_assignment
            for attr, value in assignment_data.items():
                setattr(assignment, attr, value)
            assignment.save()

            # Only create next assignment if completed and due_date <= today
            if assignment.completed and assignment.due_date.date() <= timezone.localdate():
                assignment.create_next_assignment()

        return instance