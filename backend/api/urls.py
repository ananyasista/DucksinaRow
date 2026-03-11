from django.urls import path
from rest_framework.routers import DefaultRouter
from .views.chores_views import ChoreViewSet, ChoreAssignmentViewSet
from .views.calendar_views import CalendarEventViewSet

from .views.auth_views import change_password, signup, login, me, update_profile
from .views.preferences_views import my_living_preferences
from .views.household_views import household_roommates
from .views.inventory_views import InventoryViewSet

# App routers for auth views
urlpatterns = [
    path("auth/signup/", signup),
    path("auth/login/", login),
    path("auth/profile/", me),
    path("auth/profile/update/", update_profile),
    path("auth/profile/change-password/", change_password),
    path("preferences/living/", my_living_preferences),
    path("household/roommates/", household_roommates),
]

router = DefaultRouter()
router.register(r"chore", ChoreViewSet, basename="chore")
router.register(r"chore-assignment/", ChoreAssignmentViewSet, basename="choreassignment")
router.register(r"inventory", InventoryViewSet, basename="inventory")
router.register(r"calendar/events", CalendarEventViewSet, basename="calendar-events")

urlpatterns.extend(router.urls)
