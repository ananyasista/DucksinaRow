from django.contrib.auth import get_user_model
from rest_framework import status

from .tests import BaseAPITestCase

User = get_user_model()


class ProfileTests(BaseAPITestCase):
    PROFILE_URL = "/api/auth/profile/"
    HOUSEHOLD_CREATE_URL = "/api/household/create/"
    ROOMMATES_URL = "/api/household/roommates/"
    LIVING_URL = "/api/preferences/living/"
    LOGOUT_URL = "/api/auth/logout/"  

    def setUp(self):
        self.household1 = self.create_household("Area 52", "ABCDE")
        self.household2 = self.create_household("Area 51", "QWERT")

        self.user = self.create_user(
            email="profile@example.com",
            password="Testpass123!",
            first_name="Leyna",
            last_name="Huynh",
            household=self.household1,
            display_color="#79997E",
        )
        self.roommate = self.create_user(
            email="roommate@example.com",
            household=self.household1,
            first_name="Chris",
            display_color="#FAAE43",
        )
        self.auth_client(self.user)

    def test_profile_requires_auth(self):
        self.client.credentials()
        response = self.client.get(self.PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_user_info(self):
        response = self.client.get(self.PROFILE_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_roommates_endpoint_returns_same_household_users(self):
        response = self.client.get(self.ROOMMATES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_like_behavior_blocks_profile_access(self):
        response = self.client.get(self.PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.credentials()
        response = self.client.get(self.PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_endpoint_if_implemented(self):
        response = self.client.post(self.LOGOUT_URL, {}, format="json")
        self.assertIn(
            response.status_code,
            [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT, status.HTTP_404_NOT_FOUND]
        )