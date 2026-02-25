from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
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
