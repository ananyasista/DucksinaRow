from datetime import timedelta
from django.utils import timezone
from rest_framework import status

from .tests import BaseAPITestCase


class HomeTests(BaseAPITestCase):
    MY_EVENTS_URL = "/api/calendar/events/my-events/"
    NEEDS_APPROVAL_URL = "/api/calendar/events/needs-approval/"
    EVENTS_URL = "/api/calendar/events/"
    ASSIGNMENTS_URL = "/api/chore-assignments/"

    def setUp(self):
        self.household = self.create_household("Area 52", "ABCDE")
        self.owner = self.create_user(email="owner@example.com", household=self.household, first_name="Owner")
        self.roommate = self.create_user(email="roommate@example.com", household=self.household, first_name="Roommate")
        self.auth_client(self.owner)

    def test_home_pending_actions_needs_approval_source(self):
        event = self.create_event(self.household, self.roommate, title="Approve Me", requires_approval=True)
        self.create_approval(event, self.owner, approved=False, response_time=None)

        response = self.client.get(self.NEEDS_APPROVAL_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_home_pending_actions_my_events_source(self):
        event = self.create_event(self.household, self.owner, title="My Pending Event", requires_approval=True)
        self.create_approval(event, self.roommate, approved=False, response_time=None)

        response = self.client.get(self.MY_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(e["title"] == "My Pending Event" for e in response.data))

    def test_home_my_todo_list_assignments_for_current_user(self):
        chore = self.create_chore(self.household, roommates=[self.owner, self.roommate])
        self.create_assignment(chore, assignee=self.owner, completed=False)
        self.create_assignment(chore, assignee=self.roommate, completed=False)

        response = self.client.get(self.ASSIGNMENTS_URL, {"assignee": str(self.owner.id), "completed": "false"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_home_upcoming_week_events_source(self):
        soon = timezone.now() + timedelta(days=3)
        later = timezone.now() + timedelta(days=10)

        self.create_event(
            self.household,
            self.owner,
            title="Soon Event",
            start_date=soon,
            end_date=soon + timedelta(hours=1),
        )
        self.create_event(
            self.household,
            self.owner,
            title="Later Event",
            start_date=later,
            end_date=later + timedelta(hours=1),
        )

        response = self.client.get(self.EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [e["title"] for e in response.data]
        self.assertIn("Soon Event", titles)
        self.assertIn("Later Event", titles)

    def test_home_can_fetch_event_details_for_modal(self):
        event = self.create_event(self.household, self.owner, title="Detailed Event")

        response = self.client.get(f"{self.EVENTS_URL}{event.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Detailed Event")