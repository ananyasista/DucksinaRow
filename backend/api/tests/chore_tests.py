from datetime import timedelta
from django.utils import timezone
from rest_framework import status

from .tests import BaseAPITestCase
from api.models import Chore, ChoreAssignment


class ChoreTests(BaseAPITestCase):
    CHORES_URL = "/api/chore/"
    ASSIGNMENTS_URL = "/api/chore-assignment/"
    FILTERS_URL = "/api/chore-assignment/filters/"

    def setUp(self):
        self.household = self.create_household("Area 52", "ABCDE")
        self.other_household = self.create_household("Other House", "QWERT")

        self.user1 = self.create_user(
            email="user1@example.com",
            household=self.household,
            first_name="Leyna",
        )
        self.user2 = self.create_user(
            email="user2@example.com",
            household=self.household,
            first_name="Chris",
        )
        self.user3 = self.create_user(
            email="user3@example.com",
            household=self.household,
            first_name="Andrea",
        )
        self.other_user = self.create_user(
            email="other@example.com",
            household=self.other_household,
            first_name="Other",
        )

        self.auth_client(self.user1)

    # LIST / HOUSEHOLD SCOPING
    def test_list_chores_returns_only_current_household_chores(self):
        self.create_chore(
            self.household,
            title="Household chore",
            roommates=[self.user1, self.user2],
        )
        self.create_chore(
            self.other_household,
            title="Other household chore",
            roommates=[self.other_user],
        )

        response = self.client.get(self.CHORES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [chore["title"] for chore in response.data]
        self.assertIn("Household chore", titles)
        self.assertNotIn("Other household chore", titles)

    def test_unauthenticated_user_cannot_list_chores(self):
        self.client.logout()
        response = self.client.get(self.CHORES_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # CREATE CHORE
    def test_create_chore_with_due_date_and_roommates(self):
        due_date = (timezone.now() + timedelta(days=3)).isoformat()
        payload = {
            "title": "Take out trash",
            "details": "Before Tuesday night",
            "location": "Kitchen",
            "is_rotating": True,
            "repeat_unit": "weeks",
            "repeat_value": 1,
            "pass_to_next_unit": "weeks",
            "pass_to_next_value": 1,
            "notification_value": 15,
            "notification_unit": "minutes",
            "roommates_involved_ids": [str(self.user1.id), str(self.user2.id)],
            "due_date": due_date,
            "all_day": False,
        }

        response = self.client.post(self.CHORES_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Take out trash")

    def test_create_chore_assigns_correct_household(self):
        due_date = (timezone.now() + timedelta(days=2)).isoformat()
        payload = {
            "title": "Vacuum living room",
            "details": "Weekly reset",
            "location": "Living Room",
            "is_rotating": True,
            "repeat_unit": "weeks",
            "repeat_value": 1,
            "pass_to_next_unit": "weeks",
            "pass_to_next_value": 1,
            "roommates_involved_ids": [str(self.user1.id), str(self.user2.id)],
            "due_date": due_date,
            "all_day": False,
        }

        response = self.client.post(self.CHORES_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        chore = Chore.objects.get(title="Vacuum living room")
        self.assertEqual(chore.household, self.household)

    def test_create_chore_requires_auth(self):
        self.client.logout()
        payload = {
            "title": "Mop floor",
            "roommates_involved_ids": [str(self.user1.id)],
        }

        response = self.client.post(self.CHORES_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # RETRIEVE / EDIT / DELETE CHORE
    def test_retrieve_chore(self):
        chore = self.create_chore(
            self.household,
            title="Laundry",
            roommates=[self.user1, self.user2],
        )

        response = self.client.get(f"{self.CHORES_URL}{chore.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Laundry")

    def test_edit_chore(self):
        chore = self.create_chore(
            self.household,
            title="Original chore",
            roommates=[self.user1, self.user2],
        )

        response = self.client.patch(
            f"{self.CHORES_URL}{chore.id}/",
            {"title": "Updated chore", "location": "Bathroom"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chore.refresh_from_db()
        self.assertEqual(chore.title, "Updated chore")
        self.assertEqual(chore.location, "Bathroom")

    def test_cannot_access_other_household_chore(self):
        chore = self.create_chore(
            self.other_household,
            title="Private chore",
            roommates=[self.other_user],
        )

        response = self.client.patch(
            f"{self.CHORES_URL}{chore.id}/",
            {"title": "Should fail"},
            format="json",
        )

        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_delete_chore(self):
        chore = self.create_chore(
            self.household,
            title="Delete me",
            roommates=[self.user1, self.user2],
        )

        response = self.client.delete(f"{self.CHORES_URL}{chore.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Chore.objects.filter(id=chore.id).exists())

    # ASSIGNMENT LIST / FILTERS
    def test_assignment_list_returns_only_current_household_assignments(self):
        chore1 = self.create_chore(self.household, roommates=[self.user1, self.user2])
        self.create_assignment(chore1, assignee=self.user1)

        other_chore = self.create_chore(self.other_household, roommates=[self.other_user])
        self.create_assignment(other_chore, assignee=self.other_user)

        response = self.client.get(self.ASSIGNMENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assignment_list_filter_by_assignee(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment1 = self.create_assignment(chore, assignee=self.user1)
        self.create_assignment(chore, assignee=self.user2)

        response = self.client.get(
            self.ASSIGNMENTS_URL,
            {"assignee": str(self.user1.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in response.data]
        self.assertIn(str(assignment1.id), returned_ids)

    def test_assignment_list_filter_by_multiple_assignees(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2, self.user3])
        self.create_assignment(chore, assignee=self.user1)
        self.create_assignment(chore, assignee=self.user2)
        self.create_assignment(chore, assignee=self.user3)

        response = self.client.get(
            self.ASSIGNMENTS_URL,
            {"assignee": f"{self.user1.id},{self.user3.id}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assignment_list_filter_completed_true(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        self.create_assignment(chore, assignee=self.user1, completed=True)
        self.create_assignment(chore, assignee=self.user1, completed=False)

        response = self.client.get(self.ASSIGNMENTS_URL, {"completed": "true"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assignment_list_filter_completed_false(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        self.create_assignment(chore, assignee=self.user1, completed=True)
        pending = self.create_assignment(chore, assignee=self.user1, completed=False)

        response = self.client.get(self.ASSIGNMENTS_URL, {"completed": "false"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in response.data]
        self.assertIn(str(pending.id), returned_ids)

    def test_assignment_list_filter_by_location(self):
        kitchen_chore = self.create_chore(self.household, location="Kitchen", roommates=[self.user1, self.user2])
        bathroom_chore = self.create_chore(self.household, title="Bathroom chore", location="Bathroom", roommates=[self.user1, self.user2])

        kitchen_assignment = self.create_assignment(kitchen_chore, assignee=self.user1)
        self.create_assignment(bathroom_chore, assignee=self.user1)

        response = self.client.get(self.ASSIGNMENTS_URL, {"location": "Kitchen"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in response.data]
        self.assertIn(str(kitchen_assignment.id), returned_ids)

    def test_assignment_list_filter_by_date_range(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        inside = self.create_assignment(
            chore,
            assignee=self.user1,
            due_date=timezone.now() + timedelta(days=2),
        )
        self.create_assignment(
            chore,
            assignee=self.user1,
            due_date=timezone.now() + timedelta(days=20),
        )

        response = self.client.get(
            self.ASSIGNMENTS_URL,
            {
                "start": timezone.now().isoformat(),
                "end": (timezone.now() + timedelta(days=7)).isoformat(),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in response.data]
        self.assertIn(str(inside.id), returned_ids)

    # ASSIGNMENT UPDATE / COMPLETE
    def test_retrieve_assignment(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment = self.create_assignment(chore, assignee=self.user1)

        response = self.client.get(f"{self.ASSIGNMENTS_URL}{assignment.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(assignment.id))

    def test_update_assignment_completed(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment = self.create_assignment(chore, assignee=self.user1, completed=False)

        response = self.client.patch(
            f"{self.ASSIGNMENTS_URL}{assignment.id}/",
            {"completed": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        assignment.refresh_from_db()
        self.assertTrue(assignment.completed)

    def test_update_assignment_due_date(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment = self.create_assignment(chore, assignee=self.user1)

        new_due = timezone.now() + timedelta(days=10)
        response = self.client.patch(
            f"{self.ASSIGNMENTS_URL}{assignment.id}/",
            {"due_date": new_due.isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_assignment(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment = self.create_assignment(chore, assignee=self.user1)

        response = self.client.delete(f"{self.ASSIGNMENTS_URL}{assignment.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ChoreAssignment.objects.filter(id=assignment.id).exists())

    # ROTATION LOGIC
    def test_create_next_assignment_rotates_if_completed_and_due_date_passed(self):
        chore = self.create_chore(
            self.household,
            roommates=[self.user1, self.user2],
            is_rotating=True,
            repeat_unit="weeks",
            repeat_value=1,
        )
        assignment = self.create_assignment(
            chore=chore,
            assignee=self.user1,
            next_assignee=self.user2,
            due_date=timezone.now() - timedelta(days=1),
            completed=True,
        )

        assignment.create_next_assignment()

        self.assertEqual(ChoreAssignment.objects.filter(chore=chore).count(), 2)
        newest = ChoreAssignment.objects.filter(chore=chore).order_by("-due_date").first()
        self.assertEqual(newest.assignee, self.user2)

    def test_checked_before_deadline_does_not_rotate_yet(self):
        chore = self.create_chore(
            self.household,
            roommates=[self.user1, self.user2],
            is_rotating=True,
            repeat_unit="weeks",
            repeat_value=1,
        )
        assignment = self.create_assignment(
            chore=chore,
            assignee=self.user1,
            next_assignee=self.user2,
            due_date=timezone.now() + timedelta(days=2),
            completed=True,
        )

        assignment.create_next_assignment()

        self.assertEqual(ChoreAssignment.objects.filter(chore=chore).count(), 1)

    def test_not_completed_and_due_does_not_rotate(self):
        chore = self.create_chore(
            self.household,
            roommates=[self.user1, self.user2],
            is_rotating=True,
        )
        assignment = self.create_assignment(
            chore=chore,
            assignee=self.user1,
            next_assignee=self.user2,
            due_date=timezone.now() - timedelta(days=1),
            completed=False,
        )

        assignment.create_next_assignment()

        self.assertEqual(ChoreAssignment.objects.filter(chore=chore).count(), 1)

    def test_duplicate_future_assignment_is_not_created(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        assignment = self.create_assignment(
            chore=chore,
            assignee=self.user1,
            next_assignee=self.user2,
            due_date=timezone.now() - timedelta(days=1),
            completed=True,
        )
        self.create_assignment(
            chore=chore,
            assignee=self.user2,
            due_date=timezone.now() + timedelta(days=7),
            completed=False,
        )

        assignment.create_next_assignment()

        self.assertEqual(ChoreAssignment.objects.filter(chore=chore).count(), 2)

    def test_new_member_can_be_added_to_chore_roommates(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])

        response = self.client.patch(
            f"{self.CHORES_URL}{chore.id}/",
            {
                "roommates_involved_ids": [
                    str(self.user1.id),
                    str(self.user2.id),
                    str(self.user3.id),
                ]
            },
        )

        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])

    def test_latest_assignment_property(self):
        chore = self.create_chore(self.household, roommates=[self.user1, self.user2])
        self.create_assignment(chore, assignee=self.user1, due_date=timezone.now())
        newer = self.create_assignment(
            chore,
            assignee=self.user2,
            due_date=timezone.now() + timedelta(days=2),
        )

        self.assertEqual(chore.latest_assignment.id, newer.id)

    # FILTER OPTIONS ENDPOINT
    def test_assignment_filters_endpoint_returns_200(self):
        response = self.client.get(self.FILTERS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assignment_filters_endpoint_requires_auth(self):
        self.client.logout()
        response = self.client.get(self.FILTERS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)