from django.urls import path
from .views.auth_views import signup, login, me

# App routers for auth views
urlpatterns = [
    path("auth/signup/", signup),
    path("auth/login/", login),
    path("auth/me/", me),
]