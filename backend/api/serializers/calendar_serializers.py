from django.contrib.auth import get_user_model
from rest_framework import serializers
from api.models import CalendarEvents, EventApprovals

User = get_user_model()

# Returns user info in approvals/event responses
class SimpleUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.email

# Creating/updating events
class CalendarEventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvents
        fields = [
            "id",
            "title",
            "details",
            "all_day",
            "start_date",
            "end_date",
            "repeat",
            "requires_approval",
            "location",
            "notification_value",
            "notification_unit",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError("End date must be after start date.")

        notification_value = attrs.get("notification_value")
        notification_unit = attrs.get("notification_unit")

        if notification_value is not None and not notification_unit:
            raise serializers.ValidationError(
                "Notification unit is required when notification value is set."
            )
        return attrs

# Used for event cards/list views
class CalendarEventListSerializer(serializers.ModelSerializer):
    event_owner_name = serializers.SerializerMethodField()
    display_color = serializers.SerializerMethodField()
    approval_status = serializers.SerializerMethodField()
    approval_counts = serializers.SerializerMethodField()

    class Meta:
        model = CalendarEvents
        fields = [
            "id",
            "title",
            "details",
            "all_day",
            "start_date",
            "end_date",
            "repeat",
            "requires_approval",
            "location",
            "event_owner_name",
            "display_color",
            "approval_status",
            "approval_counts",
        ]

    def get_event_owner_name(self, obj):
        if not obj.event_owner:
            return None

        full_name = f"{obj.event_owner.first_name} {obj.event_owner.last_name}".strip()
        return full_name or obj.event_owner.email

    def get_display_color(self, obj):
        if not obj.event_owner:
            return None
        return obj.event_owner.display_color

    def get_approval_status(self, obj):
        if not obj.requires_approval:
            return "approved"

        approvals = obj.approvals.all()

        if not approvals.exists():
            return "pending"

        # declined = approved=False but response_time exists
        if approvals.filter(approved=False, response_time__isnull=False).exists():
            return "declined"

        # pending = approved=False and response_time is null
        if approvals.filter(approved=False, response_time__isnull=True).exists():
            return "pending"

        return "approved"

    # How many roommates have approved
    def get_approval_counts(self, obj):
        approvals = obj.approvals.all()
        total = approvals.count()
        approved_count = approvals.filter(approved=True).count()

        return {
            "approved": approved_count,
            "total": total
        }
# Each roommate approval row
class EventApprovalSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = EventApprovals
        fields = ["user", "approved", "response_time", "status"]

    # Returns current approval status: approved | pending | declined
    def get_status(self, obj):
        if obj.approved:
            return "approved"
        if obj.response_time is None:
            return "pending"
        return "declined"
    
# Used for event detail views
class CalendarEventDetailSerializer(serializers.ModelSerializer):
    event_owner_name = serializers.SerializerMethodField()
    display_color = serializers.SerializerMethodField()
    approval_status = serializers.SerializerMethodField()
    approvals = EventApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = CalendarEvents
        fields = [
            "id",
            "title",
            "details",
            "all_day",
            "start_date",
            "end_date",
            "repeat",
            "requires_approval",
            "location",
            "notification_value",
            "notification_unit",
            "event_owner_name",
            "display_color",
            "approval_status",
            "approvals",
        ]

    def get_event_owner_name(self, obj):
        if not obj.event_owner:
            return None

        full_name = f"{obj.event_owner.first_name} {obj.event_owner.last_name}".strip()
        return full_name or obj.event_owner.email

    def get_display_color(self, obj):
        if not obj.event_owner:
            return None
        return obj.event_owner.display_color

    def get_approval_status(self, obj):
        if not obj.requires_approval:
            return "approved"

        approvals = obj.approvals.all()

        # If approval is required but approval rows do not exist yet, treat the event as pending
        if not approvals.exists():
            return "pending"

        if approvals.filter(approved=False, response_time__isnull=False).exists():
            return "declined"

        if approvals.filter(approved=False, response_time__isnull=True).exists():
            return "pending"

        return "approved"
    
# Used for the 'Needs Approval' section
class NeedsApprovalSerializer(serializers.ModelSerializer):
    event = CalendarEventListSerializer(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = EventApprovals
        fields = ["event", "approved", "response_time", "status"]

    def get_status(self, obj):
        if obj.approved:
            return "approved"
        if obj.response_time is None:
            return "pending"
        return "declined"

# Used for the approval response
class ApprovalRespondSerializer(serializers.Serializer):
    """
    Input serializer for approving or declining an event.
    Frontend sends:
    {
        "action": "approve"
    }
    or
    {
        "action": "decline"
    }
    """

    action = serializers.ChoiceField(choices=["approve", "decline"])