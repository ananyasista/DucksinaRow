from django.utils import timezone
from rest_framework import status

from .tests import BaseAPITestCase
from api.models import EventApprovals


class CalendarTests(BaseAPITestCase):
    EVENTS_URL = "/api/calendar/events/"
    MY_EVENTS_URL = "/api/calendar/events/my-events/"
    NEEDS_APPROVAL_URL = "/api/calendar/events/needs-approval/"

    def setUp(self):
        self.household = self.create_household("Area 52", "ABCDE")
        self.owner = self.create_user(
            email="owner@example.com",
            household=self.household,
            first_name="Owner",
            display_color="#79997E",
        )
        self.roommate = self.create_user(
            email="roommate@example.com",
            household=self.household,
            first_name="Roommate",
            display_color="#FAAE43",
        )
        self.roommate2 = self.create_user(
            email="roommate2@example.com",
            household=self.household,
            first_name="Chris",
            display_color="#EC8534",
        )
        self.other_household = self.create_household("Other", "QWERT")
        self.other_user = self.create_user(
            email="other@example.com",
            household=self.other_household,
        )

        self.auth_client(self.owner)

    def test_list_events_returns_only_household_events(self):
        self.create_event(self.household, self.owner, title="House Event")
        self.create_event(self.other_household, self.other_user, title="Outside Event")

        response = self.client.get(self.EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [event["title"] for event in response.data]
        self.assertIn("House Event", titles)
        self.assertNotIn("Outside Event", titles)

    def test_create_event_sets_owner_and_household(self):
        payload = {
            "title": "Movie Night",
            "details": "Bring snacks",
            "all_day": False,
            "start_date": timezone.now().isoformat(),
            "end_date": (timezone.now() + timezone.timedelta(hours=2)).isoformat(),
            "repeat": "none",
            "requires_approval": False,
            "location": "Living Room",
            "notification_value": 15,
            "notification_unit": "minutes",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Movie Night")

    def test_create_event_requires_end_after_start(self):
        start = timezone.now()
        payload = {
            "title": "Bad Event",
            "details": "",
            "all_day": False,
            "start_date": start.isoformat(),
            "end_date": start.isoformat(),
            "repeat": "none",
            "requires_approval": False,
            "location": "Kitchen",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_event_saves_location_and_time_range(self):
        start = timezone.now() + timezone.timedelta(days=2)
        end = start + timezone.timedelta(hours=3)
        payload = {
            "title": "Dinner",
            "details": "At home",
            "all_day": False,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "repeat": "none",
            "requires_approval": False,
            "location": "Kitchen",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["location"], "Kitchen")
        self.assertEqual(response.data["title"], "Dinner")

    def test_create_event_without_approval_toggle_creates_no_approval_rows(self):
        payload = {
            "title": "No Approval Needed",
            "details": "FYI only",
            "all_day": False,
            "start_date": timezone.now().isoformat(),
            "end_date": (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            "repeat": "none",
            "requires_approval": False,
            "location": "Living Room",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        event_id = response.data["id"]
        self.assertEqual(EventApprovals.objects.filter(event_id=event_id).count(), 0)

    def test_create_event_with_approval_creates_roommate_approval_rows(self):
        payload = {
            "title": "Approval Event",
            "details": "Need signoff",
            "all_day": False,
            "start_date": timezone.now().isoformat(),
            "end_date": (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            "repeat": "none",
            "requires_approval": True,
            "location": "Living Room",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        event_id = response.data["id"]

        # all roommates except owner should get approval rows
        self.assertEqual(
            EventApprovals.objects.filter(event_id=event_id).count(),
            2
        )

        response = self.client.get(self.MY_EVENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(event["id"] == event_id for event in response.data))

    def test_create_event_with_approval_excludes_owner_from_approval_rows(self):
        payload = {
            "title": "Owner Not Included",
            "details": "Need approval from others",
            "all_day": False,
            "start_date": timezone.now().isoformat(),
            "end_date": (timezone.now() + timezone.timedelta(hours=1)).isoformat(),
            "repeat": "none",
            "requires_approval": True,
            "location": "Living Room",
        }
        response = self.client.post(self.EVENTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        event_id = response.data["id"]
        self.assertFalse(
            EventApprovals.objects.filter(event_id=event_id, user=self.owner).exists()
        )

    def test_my_events_returns_only_owned_events(self):
        self.create_event(self.household, self.owner, title="Mine")
        self.create_event(self.household, self.roommate, title="Not Mine")

        response = self.client.get(self.MY_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [event["title"] for event in response.data]
        self.assertIn("Mine", titles)
        self.assertNotIn("Not Mine", titles)

    def test_list_events_can_filter_by_owner(self):
        event1 = self.create_event(self.household, self.owner, title="Owner Event")
        event2 = self.create_event(self.household, self.roommate, title="Roommate Event")

        response = self.client.get(
            self.EVENTS_URL,
            {"owners": str(self.roommate.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [event["title"] for event in response.data]
        self.assertIn("Roommate Event", titles)
        self.assertNotIn("Owner Event", titles)

    def test_list_events_can_filter_by_multiple_owners(self):
        self.create_event(self.household, self.owner, title="Owner Event")
        self.create_event(self.household, self.roommate, title="Roommate Event")
        self.create_event(self.household, self.roommate2, title="Chris Event")

        response = self.client.get(
            self.EVENTS_URL,
            {"owners": f"{self.owner.id},{self.roommate2.id}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [event["title"] for event in response.data]
        self.assertIn("Owner Event", titles)
        self.assertIn("Chris Event", titles)
        self.assertNotIn("Roommate Event", titles)

    def test_list_events_can_filter_by_month_and_year(self):
        now = timezone.now()
        next_month = now + timezone.timedelta(days=35)

        self.create_event(
            self.household,
            self.owner,
            title="This Month Event",
            start_date=now,
            end_date=now + timezone.timedelta(hours=1),
        )
        self.create_event(
            self.household,
            self.owner,
            title="Next Month Event",
            start_date=next_month,
            end_date=next_month + timezone.timedelta(hours=1),
        )

        response = self.client.get(
            self.EVENTS_URL,
            {
                "month": now.month,
                "year": now.year,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [event["title"] for event in response.data]
        self.assertIn("This Month Event", titles)
        self.assertNotIn("Next Month Event", titles)

    def test_needs_approval_returns_pending_approval_events(self):
        event = self.create_event(self.household, self.owner, title="Needs Approval", requires_approval=True)
        self.create_approval(event, self.roommate, approved=False, response_time=None)

        self.auth_client(self.roommate)
        response = self.client.get(self.NEEDS_APPROVAL_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_needs_approval_does_not_return_already_responded_events(self):
        event = self.create_event(self.household, self.owner, title="Already Answered", requires_approval=True)
        self.create_approval(
            event,
            self.roommate,
            approved=True,
            response_time=timezone.now(),
        )

        self.auth_client(self.roommate)
        response = self.client.get(self.NEEDS_APPROVAL_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_respond_approve_updates_approval(self):
        event = self.create_event(self.household, self.owner, title="Party", requires_approval=True)
        approval = self.create_approval(event, self.roommate, approved=False, response_time=None)

        self.auth_client(self.roommate)
        response = self.client.post(
            f"{self.EVENTS_URL}{event.id}/respond/",
            {"action": "approve"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        approval.refresh_from_db()
        self.assertTrue(approval.approved)
        self.assertIsNotNone(approval.response_time)

    def test_respond_decline_updates_approval(self):
        event = self.create_event(self.household, self.owner, title="Dinner", requires_approval=True)
        approval = self.create_approval(event, self.roommate, approved=False, response_time=None)

        self.auth_client(self.roommate)
        response = self.client.post(
            f"{self.EVENTS_URL}{event.id}/respond/",
            {"action": "decline"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        approval.refresh_from_db()
        self.assertFalse(approval.approved)
        self.assertIsNotNone(approval.response_time)

    def test_retrieve_event_returns_approval_rows(self):
        event = self.create_event(self.household, self.owner, title="Board Game Night", requires_approval=True)
        self.create_approval(event, self.roommate, approved=False, response_time=None)
        self.create_approval(event, self.roommate2, approved=True, response_time=timezone.now())

        response = self.client.get(f"{self.EVENTS_URL}{event.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("approvals", response.data)
        self.assertEqual(len(response.data["approvals"]), 2)

    def test_event_list_serializer_returns_pending_status(self):
        event = self.create_event(self.household, self.owner, title="Pending Status Event", requires_approval=True)
        self.create_approval(event, self.roommate, approved=False, response_time=None)

        response = self.client.get(self.MY_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event_data = next(e for e in response.data if e["id"] == str(event.id))
        self.assertEqual(event_data["approval_status"], "pending")

    def test_event_list_serializer_returns_declined_status(self):
        event = self.create_event(self.household, self.owner, title="Declined Status Event", requires_approval=True)
        self.create_approval(event, self.roommate, approved=False, response_time=timezone.now())

        response = self.client.get(self.MY_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event_data = next(e for e in response.data if e["id"] == str(event.id))
        self.assertEqual(event_data["approval_status"], "declined")

    def test_event_list_serializer_returns_approved_status(self):
        event = self.create_event(self.household, self.owner, title="Approved Status Event", requires_approval=True)
        self.create_approval(event, self.roommate, approved=True, response_time=timezone.now())
        self.create_approval(event, self.roommate2, approved=True, response_time=timezone.now())

        response = self.client.get(self.MY_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event_data = next(e for e in response.data if e["id"] == str(event.id))
        self.assertEqual(event_data["approval_status"], "approved")

    def test_owner_cannot_edit_other_users_event(self):
        event = self.create_event(self.household, self.roommate, title="Roommate Event")

        response = self.client.patch(
            f"{self.EVENTS_URL}{event.id}/",
            {"title": "Changed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_edit_own_event(self):
        event = self.create_event(self.household, self.owner, title="Original Title")

        response = self.client.patch(
            f"{self.EVENTS_URL}{event.id}/",
            {"title": "Updated Title", "location": "Bedroom"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")
        self.assertEqual(response.data["location"], "Bedroom")

    def test_owner_can_delete_own_event(self):
        event = self.create_event(self.household, self.owner, title="Delete Me")

        response = self.client.delete(f"{self.EVENTS_URL}{event.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_owner_cannot_delete_event(self):
        event = self.create_event(self.household, self.owner, title="Protected")
        self.auth_client(self.roommate)

        response = self.client.delete(f"{self.EVENTS_URL}{event.id}/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_roommate_in_other_household_cannot_see_event(self):
        event = self.create_event(self.household, self.owner, title="Private Event")

        self.auth_client(self.other_user)
        response = self.client.get(f"{self.EVENTS_URL}{event.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)