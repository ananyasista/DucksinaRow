from django.urls import path
from .views.auth_views import signup, login, me
from .views.preferences_views import my_living_preferences

# App routers for auth views
urlpatterns = [
    path("auth/signup/", signup),
    path("auth/login/", login),
    path("auth/profile/", me),
    path("preferences/living/", my_living_preferences),
]