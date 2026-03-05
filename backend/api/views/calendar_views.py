from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import CalendarEvents, EventApprovals
from api.serializers.calendar_serializers import (
    CalendarEventsSerializer,
    EventApprovalsSerializer,
)

User = get_user_model()

class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only events in the user's household
        return (
            CalendarEvents.objects
            .filter(household=self.request.user.household)
            .order_by("start_date", "title")
        )

    def perform_create(self, serializer):
        # Saves event to household and user
        event = serializer.save(
            household=self.request.user.household,
            event_owner=self.request.user,
        )

        # Create approval record if required
        if getattr(event, "requires_approval", False):
            members = User.objects.filter(household=self.request.user.household)
            for m in members:
                EventApprovals.objects.get_or_create(event=event, user=m)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Only owner can edit
        if instance.event_owner_id != request.user.id:
            return Response(
                {"detail": "Only the event owner can modify this event."},
                status=status.HTTP_403_FORBIDDEN,
            )

        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        # If requires_approval is True, ensure approval rows exist
        if getattr(updated, "requires_approval", False):
            members = User.objects.filter(household=request.user.household)
            for m in members:
                EventApprovals.objects.get_or_create(event=updated, user=m)

        return Response(self.get_serializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Only owner can delete
        if instance.event_owner_id != request.user.id:
            return Response(
                {"detail": "Only the event owner can modify this event."},
                status=status.HTTP_403_FORBIDDEN,
            )

        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Event Approvals
    @action(detail=True, methods=["get"], url_path="approvals")
    def approvals(self, request, pk=None):
        event = self.get_object()
        approvals = (
            EventApprovals.objects
            .filter(event=event)
            .order_by("-response_time")
        )
        return Response(EventApprovalsSerializer(approvals, many=True).data)

    @action(detail=False, methods=["get"], url_path="approvals/pending")
    def approvals_pending(self, request):
        pending = (
            EventApprovals.objects
            .filter(
                user=request.user,
                response_time__isnull=True,
                event__household=request.user.household,
                event__requires_approval=True,
            )
            .select_related("event")
            .order_by("event__start_date")
        )
        events = [p.event for p in pending]
        return Response(CalendarEventsSerializer(events, many=True).data)

    @action(detail=False, methods=["post"], url_path="approvals/respond")
    def approvals_respond(self, request):
        event_id = request.data.get("event_id")
        approved = request.data.get("approved")

        if event_id is None or approved is None:
            return Response(
                {"detail": "event_id and approved are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            event = CalendarEvents.objects.get(
                id=event_id,
                household=request.user.household,
            )
        except CalendarEvents.DoesNotExist:
            return Response(
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        approval, _ = EventApprovals.objects.get_or_create(
            event=event,
            user=request.user,
        )
        approval.approved = bool(approved)
        approval.response_time = timezone.now()
        approval.save()

        return Response(
            EventApprovalsSerializer(approval).data,
            status=status.HTTP_200_OK,
        )