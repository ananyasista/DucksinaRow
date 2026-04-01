from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token

from .tests import BaseAPITestCase
from api.models import Items

User = get_user_model()


class InventoryTests(BaseAPITestCase):
    ITEMS_URL = "/api/inventory/"
    FILTERS_URL = "/api/inventory/filters/"

    def setUp(self):
        self.household = self.create_household("Area 52", "ABCDE")
        self.other_household = self.create_household("Area 51", "XYZ12")

        self.user = self.create_user(
            email="user1@example.com",
            household=self.household,
            first_name="Leyna",
        )
        self.roommate = self.create_user(
            email="user2@example.com",
            household=self.household,
            first_name="Chris",
        )
        self.other_user = self.create_user(
            email="other@example.com",
            household=self.other_household,
            first_name="Other",
        )
        self.superuser = User.objects.create_superuser(
            email="admin@example.com",
            username="admin@example.com",
            password="Testpass123!",
            first_name="Admin",
            last_name="User",
            household=self.household,
        )
        Token.objects.get_or_create(user=self.superuser)
        self.auth_client(self.user)

    # LIST
    def test_list_items_returns_only_current_household_items(self):
        self.create_item(self.household, name="Soap")
        self.create_item(self.other_household, name="Hidden Item")

        response = self.client.get(self.ITEMS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Soap", names)
        self.assertNotIn("Hidden Item", names)

    def test_list_uses_list_serializer(self):
        """GET list should use InventoryListSerializer (lighter payload)."""
        self.create_item(self.household, name="Soap")
        response = self.client.get(self.ITEMS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # List serializer should return at least id and name
        self.assertIn("name", response.data[0])

    def test_superuser_can_see_all_household_items(self):
        self.create_item(self.household, name="Soap")
        self.create_item(self.other_household, name="Hidden Item")

        self.auth_client(self.superuser)
        response = self.client.get(self.ITEMS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Soap", names)
        self.assertIn("Hidden Item", names)

    # CREATE
    def test_create_item(self):
        payload = {
            "name": "Paper Towels",
            "details": "Large roll",
            "quantity": 2,
            "restock_needed": False,
            "location": "Kitchen",
        }
        response = self.client.post(self.ITEMS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Paper Towels")

    def test_create_item_assigns_correct_household(self):
        payload = {"name": "Sponge", "quantity": 1}
        response = self.client.post(self.ITEMS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = Items.objects.get(name="Sponge")
        self.assertEqual(item.household, self.household)

    def test_create_item_sets_last_purchased_by_creator_if_feature_is_implemented(self):
        payload = {
            "name": "Dish Soap",
            "details": "Blue bottle",
            "quantity": 1,
            "restock_needed": False,
            "location": "Kitchen",
        }
        response = self.client.post(self.ITEMS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = Items.objects.get(name="Dish Soap")
        # InventorySerializer.create() always sets last_purchased_by to the requester
        self.assertEqual(item.last_purchased_by, self.user)

    # ------------------------------------------------------------------
    # RETRIEVE (detail)
    # ------------------------------------------------------------------

    def test_retrieve_item(self):
        item = self.create_item(self.household, name="Bleach")
        response = self.client.get(f"{self.ITEMS_URL}{item.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Bleach")

    def test_retrieve_uses_detail_serializer(self):
        """GET detail should use InventorySerializer (full payload)."""
        item = self.create_item(self.household, name="Bleach")
        response = self.client.get(f"{self.ITEMS_URL}{item.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cannot_retrieve_other_household_item(self):
        item = self.create_item(self.other_household, name="Private Item")
        response = self.client.get(f"{self.ITEMS_URL}{item.id}/")
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    # EDIT (PATCH / PUT)
    def test_edit_item(self):
        item = self.create_item(self.household, name="Detergent", quantity=1)

        response = self.client.patch(
            f"{self.ITEMS_URL}{item.id}/",
            {"quantity": 5, "details": "Updated details"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 5)
        self.assertEqual(item.details, "Updated details")

    def test_cannot_access_other_household_item(self):
        item = self.create_item(self.other_household, name="Private Item")

        response = self.client.patch(
            f"{self.ITEMS_URL}{item.id}/",
            {"quantity": 10},
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_roommate_can_edit_same_household_item(self):
        item = self.create_item(self.household, name="Detergent", quantity=1)
        self.auth_client(self.roommate)

        response = self.client.patch(
            f"{self.ITEMS_URL}{item.id}/",
            {"quantity": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 3)

    # DELETE
    def test_delete_item(self):
        item = self.create_item(self.household, name="Paper Plates")

        response = self.client.delete(f"{self.ITEMS_URL}{item.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Items.objects.filter(id=item.id).exists())

    def test_cannot_delete_other_household_item(self):
        item = self.create_item(self.other_household, name="Secret Stash")

        response = self.client.delete(f"{self.ITEMS_URL}{item.id}/")

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.assertTrue(Items.objects.filter(id=item.id).exists())

    # RESTOCK TOGGLE
    def test_toggle_restock_needed(self):
        item = self.create_item(self.household, name="Toilet Paper", restock_needed=False)

        response = self.client.patch(
            f"{self.ITEMS_URL}{item.id}/",
            {"restock_needed": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertTrue(item.restock_needed)

    def test_unchecking_restock_can_update_last_purchased_by(self):
        item = self.create_item(
            self.household,
            name="Trash Bags",
            restock_needed=True,
            last_purchased_by=self.roommate,
        )

        response = self.client.patch(
            f"{self.ITEMS_URL}{item.id}/",
            {"restock_needed": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        # InventorySerializer.update() always sets last_purchased_by when restock is unchecked
        self.assertEqual(item.last_purchased_by, self.user)

    # FILTERS (query params)
    def test_filter_items_by_restock_needed_true(self):
        self.create_item(self.household, name="Soap", restock_needed=True)
        self.create_item(self.household, name="Towels", restock_needed=False)

        response = self.client.get(self.ITEMS_URL, {"restock_needed": "true"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Soap", names)

    def test_filter_items_by_restock_needed_false(self):
        self.create_item(self.household, name="Soap", restock_needed=True)
        self.create_item(self.household, name="Towels", restock_needed=False)

        response = self.client.get(self.ITEMS_URL, {"restock_needed": "false"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Towels", names)
        self.assertNotIn("Soap", names)

    def test_filter_items_by_location(self):
        self.create_item(self.household, name="Soap", location="Bathroom")
        self.create_item(self.household, name="Pan", location="Kitchen")

        response = self.client.get(self.ITEMS_URL, {"location": "Bathroom"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Soap", names)
        self.assertNotIn("Pan", names)

    def test_filter_items_by_last_purchased_by(self):
        self.create_item(self.household, name="Sponge", last_purchased_by=self.user)
        self.create_item(self.household, name="Cleaner", last_purchased_by=self.roommate)

        response = self.client.get(
            self.ITEMS_URL, {"last_purchased_by": str(self.user.id)}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Sponge", names)
        self.assertNotIn("Cleaner", names)

    def test_filter_items_by_multiple_purchased_by(self):
        self.create_item(self.household, name="Sponge", last_purchased_by=self.user)
        self.create_item(self.household, name="Cleaner", last_purchased_by=self.roommate)
        self.create_item(self.household, name="Mop")

        response = self.client.get(
            self.ITEMS_URL,
            {"last_purchased_by": f"{self.user.id},{self.roommate.id}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data]
        self.assertIn("Sponge", names)
        self.assertIn("Cleaner", names)
        self.assertNotIn("Mop", names)

    def test_no_filter_params_returns_all_household_items(self):
        self.create_item(self.household, name="Soap")
        self.create_item(self.household, name="Towels")

        response = self.client.get(self.ITEMS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    # FILTERS ENDPOINT  /api/items/filters/
    def test_filters_endpoint_structure(self):
        response = self.client.get(self.FILTERS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("locations", response.data)
        self.assertIn("restock", response.data)
        self.assertIn("purchased_by", response.data)

    def test_filters_endpoint_returns_only_household_locations(self):
        self.create_item(self.household, name="Soap", location="Bathroom")
        self.create_item(self.other_household, name="Mop", location="Garage")

        response = self.client.get(self.FILTERS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Bathroom", response.data["locations"])
        self.assertNotIn("Garage", response.data["locations"])

    def test_filters_endpoint_excludes_blank_locations(self):
        self.create_item(self.household, name="Soap", location="")
        self.create_item(self.household, name="Mop", location="Kitchen")

        response = self.client.get(self.FILTERS_URL)

        self.assertNotIn("", response.data["locations"])
        self.assertIn("Kitchen", response.data["locations"])

    def test_filters_endpoint_purchased_by_includes_household_members(self):
        response = self.client.get(self.FILTERS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        member_ids = [m["value"] for m in response.data["purchased_by"]]
        self.assertIn(self.user.id, member_ids)
        self.assertIn(self.roommate.id, member_ids)
        self.assertNotIn(self.other_user.id, member_ids)

    def test_filters_endpoint_purchased_by_includes_first_name(self):
        response = self.client.get(self.FILTERS_URL)

        labels = [m["label"] for m in response.data["purchased_by"]]
        self.assertIn("Leyna", labels)
        self.assertIn("Chris", labels)

    def test_filters_endpoint_restock_options(self):
        response = self.client.get(self.FILTERS_URL)

        restock_values = [r["value"] for r in response.data["restock"]]
        self.assertIn(True, restock_values)
        self.assertIn(False, restock_values)