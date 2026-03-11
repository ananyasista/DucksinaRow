from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import CalendarEvents, EventApprovals
from api.serializers.calendar_serializers import (
    CalendarEventCreateSerializer,
    CalendarEventListSerializer,
    CalendarEventDetailSerializer,
    NeedsApprovalSerializer,
    ApprovalRespondSerializer,
)

User = get_user_model()

"""
Handles calendar events: 
- household calendar list
- my created events
- events I still need to approve
- approve/decline response
"""
class CalendarEventViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_household_users(self, user):
        return User.objects.filter(household=user.household)

    # Return events to the requesting user
    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return CalendarEvents.objects.all()

        if not user.household:
            return CalendarEvents.objects.none()

        return CalendarEvents.objects.filter(
            household=user.household
        ).select_related(
            "event_owner",
            "household"
        ).prefetch_related(
            "approvals__user"
        )

    # List all events for the current user's household
    def list(self, request):
        queryset = self.get_queryset()

        mine = request.query_params.get("mine")
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        owners = request.query_params.get("owners")

        # Filter just current user's events
        if mine == "true":
            queryset = queryset.filter(event_owner=request.user)

        # Filter by one or more selected roommate
        if owners:
            owner_ids = [owner_id.strip() for owner_id in owners.split(",") if owner_id.strip()]
            queryset = queryset.filter(event_owner__id__in=owner_ids)

        # Optional month/year filtering for calendar views
        if month and year:
            queryset = queryset.filter(
                start_date__month=month,
                start_date__year=year
            )

        queryset = queryset.order_by("start_date")
        serializer = CalendarEventListSerializer(queryset, many=True)
        return Response(serializer.data)

    # Retrieve a specific event details 
    def retrieve(self, request, pk=None):
        event = get_object_or_404(self.get_queryset(request), pk=pk)
        serializer = CalendarEventDetailSerializer(event)
        return Response(serializer.data)

    # Create a new event
    @transaction.atomic
    def create(self, request):
        serializer = CalendarEventCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event = serializer.save(
            household=request.user.household,
            event_owner=request.user
        )

        # Only create approval rows if this event requires approval
        if event.requires_approval:
            household_users = self.get_household_users(request.user).exclude(id=request.user.id)

            approval_rows = []
            for roommate in household_users:
                approval_rows.append(
                    EventApprovals(
                        event=event,
                        user=roommate,
                        approved=False,       # default false
                        response_time=None    # null means still pending
                    )
                )

            EventApprovals.objects.bulk_create(approval_rows)

        detail_serializer = CalendarEventDetailSerializer(event)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    # Only the event owner can edit the event
    def partial_update(self, request, pk=None):
        event = get_object_or_404(self.get_queryset(request), pk=pk)

        if event.event_owner != request.user:
            return Response(
                {"detail": "Only the event owner can edit this event."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CalendarEventCreateSerializer(event, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(CalendarEventDetailSerializer(event).data)

    # Delete an event
    def destroy(self, request, pk=None):
        event = get_object_or_404(self.get_queryset(request), pk=pk)

        if event.event_owner != request.user:
            return Response(
                {"detail": "Only the event owner can delete this event."},
                status=status.HTTP_403_FORBIDDEN
            )

        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Get all approval rows for the current user > "Needs Approval" section
    @action(detail=False, methods=["get"], url_path="needs-approval")
    def needs_approval(self, request):
        approvals = EventApprovals.objects.filter(
            user=request.user,
            approved=False,
            response_time__isnull=True,
            event__household=request.user.household,
            event__requires_approval=True
        ).select_related(
            "event",
            "event__event_owner"
        ).prefetch_related(
            "event__approvals"
        ).order_by("event__start_date")

        serializer = NeedsApprovalSerializer(approvals, many=True)
        return Response(serializer.data)

    # Get all events for the current user's household > "My Events" section
    @action(detail=False, methods=["get"], url_path="my-events")
    def my_events(self, request):
        events = self.get_queryset(request).filter(
            event_owner=request.user
        ).order_by("start_date")

        serializer = CalendarEventListSerializer(events, many=True)
        return Response(serializer.data)

    # Respond to an event approval request
    @action(detail=True, methods=["post"], url_path="respond")
    def respond(self, request, pk=None):
        """
        Request body:
        {
            "action": "approve"
        }
        or
        {
            "action": "decline"
        }
        """
        event = get_object_or_404(self.get_queryset(request), pk=pk)

        approval = get_object_or_404(
            EventApprovals,
            event=event,
            user=request.user
        )

        serializer = ApprovalRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_value = serializer.validated_data["action"]

        if action_value == "approve":
            approval.approved = True
            approval.response_time = timezone.now()
        else:
            approval.approved = False
            approval.response_time = timezone.now()

        approval.save()

        return Response(CalendarEventDetailSerializer(event).data)