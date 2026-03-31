from rest_framework import serializers
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
from ..models import Chore, ChoreAssignment
from .serializers import SimpleUserSerializer, User
from datetime import timedelta
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

class ChoreMiniSerializer(serializers.ModelSerializer):
    roommates_involved = SimpleUserSerializer(many=True, read_only=True)

    class Meta:
        model = Chore
        fields = [
            "id",
            "title",
            "details",
            "location",
            "is_rotating",
            "repeat_unit",
            "repeat_value",
            "pass_to_next_unit",
            "pass_to_next_value",
            "household",  # this will be ID by default
            "roommates_involved",
        ]

class ChoreAssignmentSerializer(serializers.ModelSerializer):
    assignee = SimpleUserSerializer(read_only=True)
    next_assignee = SimpleUserSerializer(read_only=True)
    # Only include minimal chore info to avoid circular dependency
    chore = ChoreMiniSerializer(read_only=True)

    class Meta:
        model = ChoreAssignment
        fields = [ "id", "assignee", "next_assignee", "due_date", "completed", "completed_date", "all_day", "chore"]

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

    due_date = serializers.DateTimeField(required=True, write_only=True)
    all_day = serializers.BooleanField(default=True, write_only=True)
    completed = serializers.BooleanField(required=False, write_only=True)

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
        # print("Validated Data: ", validated_data)
        roommates_ids = validated_data.pop("roommates_involved_ids", None)
        # Update Chore fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Roommates
        if roommates_ids is not None:
            users = User.objects.filter(id__in=[u.id if isinstance(u, User) else u for u in roommates_ids])
            instance.roommates_involved.set(users)

        
        # Update latest_assignment
        latest_assignment = instance.latest_assignment
        if latest_assignment:
            due_date = validated_data.pop("due_date", None)
            all_day = validated_data.pop("all_day", None)
            completed = validated_data.pop("completed", None)

            # Update assignment fields
            if due_date is not None:
                latest_assignment.due_date = ensure_aware_datetime(
                    due_date,
                    all_day=all_day if all_day is not None else latest_assignment.all_day
                )

            if all_day is not None:
                latest_assignment.all_day = all_day

            if completed is not None:
                latest_assignment.completed = completed
                if completed:
                    latest_assignment.completed_date = timezone.now()
            
            latest_assignment.save()

        # Decide if we should create next assignment
        if completed is True:
            should_create_next = (
                latest_assignment.due_date and
                latest_assignment.due_date <= timezone.now()
            )

            if should_create_next:
                self._create_next_assignment(instance, latest_assignment)

        return instance
    
    def create(self, validated_data):
        user = self.context["request"].user
        roommates = validated_data.pop("roommates_involved_ids", [])

        # print(validated_data)

        # Extract Chore fields
        title = validated_data.pop("title")
        details = validated_data.pop("details", "")
        location = validated_data.pop("location", None)
        is_rotating = validated_data.pop("is_rotating", False)
        repeat_unit = validated_data.pop("repeat_unit", None)
        repeat_value = validated_data.pop("repeat_value", None)
        pass_to_next_unit = validated_data.pop("pass_to_next_unit", None)
        pass_to_next_value = validated_data.pop("pass_to_next_value", None)
        all_day = validated_data.pop("all_day", True)
        # Due date
        due_date = validated_data.pop("due_date")
        due_date = ensure_aware_datetime(due_date, all_day=all_day)
        completed = False

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
            household=user.household,
        )

        # Set roommates involved
        # Extract IDs from UserSummary dicts
        if roommates:
            # Extract IDs from dicts (UserSummary) or User objects
            roommate_ids = [u["id"] if isinstance(u, dict) else u.id for u in roommates]
            users = User.objects.filter(id__in=roommate_ids)
            chore.roommates_involved.set(users)
        else:
            # Default assignee is the current user
            chore.roommates_involved.set([user])

        # Determine first assignee & next assignee
        assignee = roommates[0] if roommates else user
        next_assignee = roommates[1] if len(roommates) > 1 else user

        # Create first assignment
        ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=due_date,
            completed=completed,
            all_day=all_day
        )

        return chore
    
    def _create_next_assignment(self, chore, current_assignment):
        if not chore.repeat_unit:
            return
        
        # Prevent duplicate creation
        if chore.assignments.filter(completed=False).exists():
            return

        # --- Calculate next due date ---
        # Calculate next due date
        next_due_date = current_assignment.due_date

        if chore.repeat_unit == "days":
            next_due_date += timedelta(days=chore.repeat_value or 1)
        elif chore.repeat_unit == "weeks":
            next_due_date += timedelta(weeks=chore.repeat_value or 1)

        # Rotation logic
        if chore.is_rotating:
            assignee = current_assignment.next_assignee
            next_assignee = current_assignment.assignee
        else:
            assignee = current_assignment.assignee
            next_assignee = current_assignment.next_assignee

        ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=next_due_date,
            all_day=current_assignment.all_day,
            completed=False
        )