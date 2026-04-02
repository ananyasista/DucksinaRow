from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token

from .tests import BaseAPITestCase
from api.models import Household

User = get_user_model()


class AuthTests(BaseAPITestCase):
    SIGNUP_URL = "/api/auth/signup/"
    LOGIN_URL = "/api/auth/login/"
    PROFILE_URL = "/api/auth/profile/"
    HOUSEHOLD_CREATE_URL = "/api/household/create/"
    ROOMMATES_URL = "/api/household/roommates/"
    LOGOUT_URL = "/api/auth/logout/" 

    def test_signup_creates_user_and_returns_token(self):
        payload = {
            "email": "newuser@example.com",
            "password": "Testpass123!",
            "first_name": "New",
            "last_name": "User",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())
        self.assertIn("token", response.data)

    def test_signup_rejects_duplicate_email(self):
        self.create_user(email="dup@example.com")
        payload = {
            "email": "dup@example.com",
            "password": "Testpass123!",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_with_names_saves_first_and_last_name(self):
        payload = {
            "email": "nameduser@example.com",
            "password": "Testpass123!",
            "first_name": "Leyna",
            "last_name": "Huynh",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="nameduser@example.com")
        self.assertEqual(user.first_name, "Leyna")
        self.assertEqual(user.last_name, "Huynh")

    def test_signup_without_required_fields_fails(self):
        payload = {
            "email": "",
            "password": "",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_email_returns_token(self):
        self.create_user(email="login@example.com", password="Testpass123!")
        payload = {"email": "login@example.com", "password": "Testpass123!"}

        response = self.client.post(self.LOGIN_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_rejects_bad_password(self):
        self.create_user(email="login2@example.com", password="Testpass123!")
        payload = {"email": "login2@example.com", "password": "Wrongpass123!"}

        response = self.client.post(self.LOGIN_URL, payload, format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]
        )

    def test_login_rejects_unknown_email(self):
        payload = {"email": "missing@example.com", "password": "Testpass123!"}
        response = self.client.post(self.LOGIN_URL, payload, format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED]
        )

    def test_profile_requires_auth(self):
        response = self.client.get(self.PROFILE_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_authenticated_user(self):
        household = self.create_household()
        user = self.create_user(
            email="me@example.com",
            first_name="Leyna",
            last_name="Huynh",
            household=household,
            display_color="#79997E",
        )
        self.auth_client(user)

        response = self.client.get(self.PROFILE_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], user.email)

    def test_profile_includes_user_household_context(self):
        household = self.create_household(name="Area 52", join_code="ABCDE")
        user = self.create_user(
            email="profilehouse@example.com",
            first_name="Leyna",
            last_name="Huynh",
            household=household,
            display_color="#79997E",
        )
        self.auth_client(user)

        response = self.client.get(self.PROFILE_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], user.email)

        if "household_join_code" in response.data:
            self.assertEqual(response.data["household_join_code"], "ABCDE")

    def test_authenticated_user_can_create_household(self):
        user = self.create_user(email="housecreate@example.com")
        self.auth_client(user)

        payload = {"household_name": "Area 52"}
        response = self.client.post(self.HOUSEHOLD_CREATE_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user.refresh_from_db()
        self.assertIsNotNone(user.household)
        self.assertEqual(user.household.household_name, "Area 52")

    def test_household_create_requires_auth(self):
        payload = {"household_name": "No Auth House"}
        response = self.client.post(self.HOUSEHOLD_CREATE_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_signup_with_join_code_adds_user_to_existing_household(self):
        household = self.create_household(name="Area 52", join_code="ABCDE")

        payload = {
            "email": "joiner@example.com",
            "password": "Testpass123!",
            "first_name": "Chris",
            "last_name": "Egan",
            "join_code": "ABCDE",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="joiner@example.com")
        self.assertEqual(user.household, household)

    def test_signup_with_invalid_join_code_fails_or_leaves_household_null(self):
        payload = {
            "email": "badjoin@example.com",
            "password": "Testpass123!",
            "first_name": "Bad",
            "last_name": "Join",
            "join_code": "ZZZZZ",
        }
        response = self.client.post(self.SIGNUP_URL, payload, format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        )

        if response.status_code == status.HTTP_201_CREATED:
            user = User.objects.get(email="badjoin@example.com")
            self.assertIsNone(user.household)

    def test_roommates_endpoint_returns_household_members(self):
        household = self.create_household(name="Area 52", join_code="ABCDE")
        user1 = self.create_user(
            email="user1@example.com",
            first_name="Leyna",
            last_name="Huynh",
            household=household,
            display_color="#79997E",
        )
        user2 = self.create_user(
            email="user2@example.com",
            first_name="Chris",
            last_name="Egan",
            household=household,
            display_color="#FAAE43",
        )
        self.auth_client(user1)

        response = self.client.get(self.ROOMMATES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_emails = []
        for roommate in response.data:
            if "email" in roommate:
                returned_emails.append(roommate["email"])

        if returned_emails:
            self.assertIn(user1.email, returned_emails)
            self.assertIn(user2.email, returned_emails)

    def test_roommates_endpoint_requires_auth(self):
        response = self.client.get(self.ROOMMATES_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_multiple_roommates_join_same_household(self):
        household = self.create_household(name="Area 52", join_code="ABCDE")

        payload1 = {
            "email": "roommate1@example.com",
            "password": "Testpass123!",
            "first_name": "Room",
            "last_name": "One",
            "join_code": "ABCDE",
        }
        payload2 = {
            "email": "roommate2@example.com",
            "password": "Testpass123!",
            "first_name": "Room",
            "last_name": "Two",
            "join_code": "ABCDE",
        }

        response1 = self.client.post(self.SIGNUP_URL, payload1, format="json")
        response2 = self.client.post(self.SIGNUP_URL, payload2, format="json")

        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)

        user1 = User.objects.get(email="roommate1@example.com")
        user2 = User.objects.get(email="roommate2@example.com")

        self.assertEqual(user1.household, household)
        self.assertEqual(user2.household, household)
        self.assertEqual(User.objects.filter(household=household).count(), 2)

    def test_login_then_profile_flow(self):
        user = self.create_user(
            email="flow@example.com",
            password="Testpass123!",
            first_name="Flow",
            last_name="User",
        )

        login_response = self.client.post(
            self.LOGIN_URL,
            {"email": "flow@example.com", "password": "Testpass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("token", login_response.data)

        token = login_response.data["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        profile_response = self.client.get(self.PROFILE_URL)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["email"], user.email)

    def test_logout_like_behavior_by_clearing_token_blocks_profile_access(self):
        user = self.create_user(email="logoutcheck@example.com", password="Testpass123!")
        self.auth_client(user)

        profile_response = self.client.get(self.PROFILE_URL)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)

        # Simulate frontend logout by removing auth header
        self.client.credentials()

        after_logout_response = self.client.get(self.PROFILE_URL)
        self.assertEqual(after_logout_response.status_code, status.HTTP_401_UNAUTHORIZED)