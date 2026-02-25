from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"households", HouseholdViewSet)
router.register(r"users", UserViewSet)
router.register(r"living-preferences", LivingPreferencesViewSet)
router.register(r"notification-preferences", NotificationPreferencesViewSet)
router.register(r"items", ItemsViewSet)
router.register(r"chores", ChoresViewSet)
router.register(r"events", CalendarEventsViewSet)
router.register(r"event-approvals", EventApprovalsViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
