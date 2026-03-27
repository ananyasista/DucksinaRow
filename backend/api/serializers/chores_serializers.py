from rest_framework import serializers
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
from ..models import Chore, ChoreAssignment
from .serializers import SimpleUserSerializer, User
import datetime

def ensure_aware_datetime(value, all_day=False):
    """
    Converts strings or naive datetimes into timezone-aware datetimes.
    If all_day is True, sets time to midnight.
    """
    if isinstance(value, str):
        # Try full datetime first
        dt = parse_datetime(value)
        if dt is None:
            # Parse as date-only
            d = parse_date(value)
            dt = datetime.datetime.combine(d, datetime.time.min)
    elif isinstance(value, datetime.date) and not isinstance(value, datetime.datetime):
        dt = datetime.datetime.combine(value, datetime.time.min)
    else:
        dt = value

    if all_day:
        dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)

    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)

    return dt


class ChoreAssignmentSerializer(serializers.ModelSerializer):
    assignee = SimpleUserSerializer(read_only=True)
    next_assignee = SimpleUserSerializer(read_only=True)
    class Meta:
        model = ChoreAssignment
        fields = [
            "id", "assignee", "next_assignee",
            "due_date", "completed", "completed_date", "all_day"
        ]

class ChoreSerializer(serializers.ModelSerializer):
    latest_assignment = ChoreAssignmentSerializer(required=False)
    all_assignments = serializers.SerializerMethodField()
    
    roommates_involved = SimpleUserSerializer(many=True, read_only=True)
    roommates_involved_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Chore
        fields = "__all__"
        read_only_fields = ("id", "household")

    def get_all_assignments(self, obj):
        request = self.context.get("request")
        qs = obj.assignments.all()
        if request:
            completed_param = request.query_params.get("completed")
            if completed_param is not None:
                if completed_param.lower() == "true":
                    qs = qs.filter(completed=True)
                elif completed_param.lower() == "false":
                    qs = qs.filter(completed=False)
        return ChoreAssignmentSerializer(qs, many=True).data

    def update(self, instance, validated_data):
        assignment_data = validated_data.pop("latest_assignment", None)

        # Update Chore fields
        for attr, value in validated_data.items():
            if attr == "due_date" and value:
                value = ensure_aware_datetime(value, all_day=instance.all_day)
            setattr(instance, attr, value)
        instance.save()
        instance.refresh_from_db()

        # Update latest_assignment
        if assignment_data:
            assignment = getattr(instance, "latest_assignment", None)
            if assignment:
                for attr, value in assignment_data.items():
                    if attr == "due_date" and value:
                        value = ensure_aware_datetime(value, all_day=assignment.all_day)
                    setattr(assignment, attr, value)
                assignment.save()

        return instance
    
    def create(self, validated_data):
        user = self.context["request"].user
        roommates = validated_data.pop("roommates_involved_ids", [])

        # Extract Chore fields
        title = validated_data.pop("title")
        details = validated_data.pop("details", "")
        location = validated_data.pop("location", None)
        is_rotating = validated_data.pop("is_rotating", False)
        repeat_unit = validated_data.pop("repeat_unit", None)
        repeat_value = validated_data.pop("repeat_value", None)
        pass_to_next_unit = validated_data.pop("pass_to_next_unit", None)
        pass_to_next_value = validated_data.pop("pass_to_next_value", None)
        all_day = validated_data.get("all_day", True)

        # Due date
        due_date = validated_data.pop("due_date")
        due_date = ensure_aware_datetime(due_date, all_day=all_day)

        # Create Chore
        chore = Chore.objects.create(
            title=title,
            details=details,
            location=location,
            is_rotating=is_rotating,
            repeat_unit=repeat_unit,
            repeat_value=repeat_value,
            pass_to_next_unit=pass_to_next_unit,
            pass_to_next_value=pass_to_next_value,
            all_day=all_day,
            household=user.household,
            due_date=due_date
        )

        # Set roommates involved
        if roommates:
            chore.roommates_involved.set(roommates)
        else:
            roommates = [user]  # default assignee if no roommates

        # Determine first assignee & next assignee
        assignee = roommates[0] if roomates else user
        next_assignee = roommates[1] if len(roommates) > 1 else user

        # Create first assignment
        ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=due_date,
            completed=False,
            all_day=all_day
        )

        return chore