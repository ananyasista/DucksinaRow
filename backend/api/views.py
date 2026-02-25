from django.shortcuts import render
from django.db.models import Q
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import *
from .serializers import *

@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})

# CRUD Endpoints
# Users
# TODO: Replace endpoint with user's endpoint with auth
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Household 
class HouseholdViewSet(viewsets.ModelViewSet):
    queryset = Household.objects.all()
    serializer_class = HouseholdSerializer

# Living Preferences
# TODO: Restrict so users can only read/update their own preferences 
class LivingPreferencesViewSet(viewsets.ModelViewSet):
    queryset = LivingPreferences.objects.all()
    serializer_class = LivingPreferencesSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Get preferences for a specific user
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        # View all preferences for roommates in one household
        household_id = self.request.query_params.get("household")
        if household_id:
            qs = qs.filter(user__household_id=household_id)

        return qs

# Notification Preferences
# TODO: Restrict so users can only read/update their own notifications settings 
class NotificationPreferencesViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreferences.objects.all()
    serializer_class = NotificationPreferencesSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Get preferences for a specific user
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        return qs

"""
INVENTORY ITEMS 

Model fields include:
- household (FK)
- name, details
- quantity, location, restock_needed
- last_purchased_date, last_purchased_by
- created_date

TODO: Replace query_param with auth user
TODO: Create, update, delete
"""
class ItemsViewSet(viewsets.ModelViewSet):
    queryset = Items.objects.all()
    serializer_class = ItemsSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Return items for that household only
        household_id = self.request.query_params.get("household")
        if household_id:
            qs = qs.filter(household_id=household_id)

        # Filtering by last_purchased
        last_purchased_by = self.request.query_params.get("last_purchased_by")
        if last_purchased_by:
            qs = qs.filter(last_purchased_by_id=last_purchased_by)

        # Filtering by location
        location = self.request.query_params.get("location")
        if location:
            qs = qs.filter(location__iexact=location)

        # Filtering by restock_needed
        restock = self.request.query_params.get("restock_needed")
        if restock is not None:
            restock_lower = restock.lower()
            if restock_lower in ["true", "1", "yes"]:
                qs = qs.filter(restock_needed=True)
            elif restock_lower in ["false", "0", "no"]:
                qs = qs.filter(restock_needed=False)

        # Default sorting
        return qs.order_by("name")

"""
CHORES 

Model fields include:
- household (FK)
- title, details, date, all_day, repeat
- assigned_roommate, roommates_involved (M2M)
- is_rotating, next_assignee
- location
- notification_value, notification_unit
- completed

TODO: Replace query_param with auth user
TODO: Create, read, update, delete
"""
class ChoresViewSet(viewsets.ModelViewSet):
    queryset = Chores.objects.all()
    serializer_class = ChoresSerializer


"""
CALENDAR EVENTS

Model fields include:
- household (FK)
- title, details, all_day
- start_date, end_date
- repeat
- requires_approval
- location
- event_owner (FK)
- notification_value, notification_unit
"""
class CalendarEventsViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvents.objects.all()
    serializer_class = CalendarEventsSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Return calendar for household
        household_id = self.request.query_params.get("household")
        if household_id:
            qs = qs.filter(household_id=household_id)

        # Filter by person
        owner_id = self.request.query_params.get("owner")
        if owner_id:
            qs = qs.filter(event_owner_id=owner_id)

        # Filter by requires_approval
        requires_approval = self.request.query_params.get("requires_approval")
        if requires_approval is not None:
            ra = requires_approval.lower()
            if ra in ["true", "1", "yes"]:
                qs = qs.filter(requires_approval=True)
            elif ra in ["false", "0", "no"]:
                qs = qs.filter(requires_approval=False)
        
        return qs.order_by("start_date", "title")

    # Approvals tab
    @action(detail=True, methods=["GET"], url_path="approvals")
    def approvals(self, request, pk=None):
        approvals_qs = EventApprovals.objects.filter(event_id=pk).order_by("-response_time")
        return Response(EventApprovalsSerializer(approvals_qs, many=True).data)


"""
EVENT APPROVALS

Model fields include:
- event (FK to CalendarEvents)
- user (FK to User)
- approved (bool)
- response_time (datetime)
"""
class EventApprovalsViewSet(viewsets.ModelViewSet):
    queryset = EventApprovals.objects.all()
    serializer_class = EventApprovalsSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Filter approvals for events
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)

        # Filter approvals for a specific user
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        return qs.order_by("response_time")
    
    @action(detail=False, methods=["GET"], url_path="needs-approval")
    def needs_approval(self, request):
        """
        READ: Needs approval list

        GET /event-approvals/needs-approval/?household=<uuid>&user=<uuid>

        Returns CalendarEvents that:
          - are in the household
          - require approval
          - AND the user has not responded to yet
        """
        household_id = request.query_params.get("household")
        user_id = request.query_params.get("user")

        if not household_id or not user_id:
            return Response(
                {"error": "household and user query params are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Events that require approval
        events_qs = CalendarEvents.objects.filter(
            household_id=household_id,
            requires_approval=True,
        )

        # Events already responded to by this user
        responded_event_ids = EventApprovals.objects.filter(
            user_id=user_id
        ).values_list("event_id", flat=True)

        # Only events the user still needs to respond to
        events_qs = events_qs.exclude(id__in=responded_event_ids).order_by("start_date")

        return Response(CalendarEventsSerializer(events_qs, many=True).data)
    
    # Approve Event
    @action(detail=False, methods=["POST"], url_path="approve")
    def approve(self, request):
        event_id = request.data.get("event")
        user_id = request.data.get("user")

        if not event_id or not user_id:
            return Response(
                {"error": "event and user are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        approval, _ = EventApprovals.objects.update_or_create(
            event_id=event_id,
            user_id=user_id,
            defaults={"approved": True, "response_time": timezone.now()},
        )
        return Response(EventApprovalsSerializer(approval).data, status=status.HTTP_200_OK)

    # Decline event
    @action(detail=False, methods=["POST"], url_path="decline")
    def decline(self, request):
        event_id = request.data.get("event")
        user_id = request.data.get("user")

        if not event_id or not user_id:
            return Response(
                {"error": "event and user are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        approval, _ = EventApprovals.objects.update_or_create(
            event_id=event_id,
            user_id=user_id,
            defaults={"approved": False, "response_time": timezone.now()},
        )
        return Response(EventApprovalsSerializer(approval).data, status=status.HTTP_200_OK)

