from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from api.models import (
    Household,
    Items,
    Chore,
    ChoreAssignment,
    CalendarEvents,
    EventApprovals,
)

User = get_user_model()


class BaseAPITestCase(APITestCase):
    def create_household(self, name="Area 52", join_code="ABCDE"):
        return Household.objects.create(household_name=name, join_code=join_code)

    def create_user(
        self,
        email="user@example.com",
        password="Testpass123!",
        first_name="Test",
        last_name="User",
        household=None,
        display_color="#79997E",
    ):
        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            household=household,
            display_color=display_color,
        )
        Token.objects.get_or_create(user=user)
        return user

    def auth_client(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def create_item(
        self,
        household,
        name="Paper Towels",
        quantity=2,
        restock_needed=False,
        last_purchased_by=None,
        location="Kitchen",
    ):
        return Items.objects.create(
            household=household,
            name=name,
            quantity=quantity,
            restock_needed=restock_needed,
            last_purchased_by=last_purchased_by,
            location=location,
        )

    def create_chore(
        self,
        household,
        title="Take out trash",
        repeat_unit="weeks",
        repeat_value=1,
        pass_to_next_unit="weeks",
        pass_to_next_value=1,
        is_rotating=True,
        notification_value=10,
        notification_unit="minutes",
        roommates=None,
        location="Kitchen",
    ):
        chore = Chore.objects.create(
            household=household,
            title=title,
            repeat_unit=repeat_unit,
            repeat_value=repeat_value,
            pass_to_next_unit=pass_to_next_unit,
            pass_to_next_value=pass_to_next_value,
            is_rotating=is_rotating,
            notification_value=notification_value,
            notification_unit=notification_unit,
            location=location,
        )
        if roommates:
            chore.roommates_involved.set(roommates)
        return chore

    def create_assignment(
        self,
        chore,
        assignee,
        next_assignee=None,
        due_date=None,
        completed=False,
        all_day=False,
    ):
        due_date = due_date or (timezone.now() + timedelta(days=1))
        return ChoreAssignment.objects.create(
            chore=chore,
            assignee=assignee,
            next_assignee=next_assignee,
            due_date=due_date,
            completed=completed,
            all_day=all_day,
        )

    def create_event(
        self,
        household,
        owner,
        title="Bridgerton Watch Party",
        start_date=None,
        end_date=None,
        requires_approval=False,
        location="Living Room",
        all_day=False,
        notification_value=30,
        notification_unit="minutes",
    ):
        start_date = start_date or (timezone.now() + timedelta(days=1))
        end_date = end_date or (start_date + timedelta(hours=2))
        return CalendarEvents.objects.create(
            household=household,
            event_owner=owner,
            title=title,
            details="Event details",
            all_day=all_day,
            start_date=start_date,
            end_date=end_date,
            repeat="none",
            requires_approval=requires_approval,
            location=location,
            notification_value=notification_value,
            notification_unit=notification_unit,
        )

    def create_approval(self, event, user, approved=False, response_time=None):
        return EventApprovals.objects.create(
            event=event,
            user=user,
            approved=approved,
            response_time=response_time,
        )