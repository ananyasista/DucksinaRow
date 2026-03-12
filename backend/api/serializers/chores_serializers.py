from rest_framework import serializers
from django.utils import timezone
from ..models import Chore, ChoreAssignment
from .serializers import SimpleUserSerializer


class ChoreAssignmentSerializer(serializers.ModelSerializer):
    assignee = SimpleUserSerializer(read_only=True)
    next_assignee = SimpleUserSerializer(read_only=True)
    chore_id = serializers.PrimaryKeyRelatedField(source="chore", read_only=True)

    class Meta:
        model = ChoreAssignment
        fields = ["id", "chore_id", "assignee", "next_assignee", "due_date", "completed", "all_day"]

# class ChoreListSerializer(serializers.ModelSerializer):
#     assignee = serializers.SerializerMethodField()
#     due_date = serializers.SerializerMethodField()
#     completed = serializers.SerializerMethodField()

#     class Meta:
#         model = Chore
#         fields = [
#             "id",
#             "household",
#             "title",
#             "assignee",
#             "due_date",
#             "completed",
#         ]
#     def get_latest_assignment(self, obj):
#         return obj.assignments.order_by("-due_date").first()

#     def get_assignee(self, obj):
#         assignment = self.get_latest_assignment(obj)
#         if assignment and assignment.assignee:
#             return SimpleUserSerializer(assignment.assignee).data
#         return None

#     def get_due_date(self, obj):
#         assignment = self.get_latest_assignment(obj)
#         return assignment.due_date if assignment else None

#     def get_completed(self, obj):
#         assignment = self.get_latest_assignment(obj)
#         return assignment.completed if assignment else False

    

class ChoreSerializer(serializers.ModelSerializer):
    assignee = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()
    roommates_involved = SimpleUserSerializer(many=True, read_only=True)
    next_assignee = serializers.SerializerMethodField()

    class Meta:
        model = Chore
        fields = "__all__"
        read_only_fields = ("id", "household")

    def get_latest_assignment(self, obj):
        return obj.assignments.order_by("-due_date").first()

    def get_assignee(self, obj):
        assignment = self.get_latest_assignment(obj)
        if assignment and assignment.assignee:
            return SimpleUserSerializer(assignment.assignee).data
        return None
    
    def get_next_assignee(self, obj):
        assignment = self.get_latest_assignment(obj)
        if assignment and assignment.next_assignee:
            return SimpleUserSerializer(assignment.next_assignee).data
        return None

    def get_due_date(self, obj):
        assignment = self.get_latest_assignment(obj)
        return assignment.due_date if assignment else None

    def get_completed(self, obj):
        assignment = self.get_latest_assignment(obj)
        return assignment.completed if assignment else False

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
        
        # When to pass to the next roommate
        if data.get("pass_to_next_unit") and not data.get("pass_to_next_value"):
            raise serializers.ValidationError(
                "pass_to_next_value required if unit is set."
            )

        # Notification Logic
        if data.get("notification_unit") and not data.get("notification_value"):
            raise serializers.ValidationError(
                "Notification value required if unit is set."
            )

        return data
    
    def create(self, validated_data):
        roommates = validated_data.pop("roommates_involved", [])
        if not roommates:
            raise serializers.ValidationError("Must have roommates involved")

        # Create chore
        chore = Chore.objects.create(**validated_data)

        # Determine initial assignee & next assignee
        assignee = roommates[0]
        next_assignee = roommates[1] if len(roommates) > 1 else None

        # Create first assignment
        ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=validated_data.get("due_date"),
            completed=False,
            all_day=validated_data.get("all_day", True),
        )

        return chore