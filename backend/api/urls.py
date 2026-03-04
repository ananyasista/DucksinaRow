from django.urls import path
from .views.auth_views import signup, login, me
from rest_framework.routers import DefaultRouter
from .views.chores_views import ChoreViewSet

# App routers for auth views
urlpatterns = [
    path("auth/signup/", signup),
    path("auth/login/", login),
    path("auth/me/", me),
]

router = DefaultRouter()
router.register(r"chores", ChoreViewSet, basename="chores")

urlpatterns.extend(router.urls)