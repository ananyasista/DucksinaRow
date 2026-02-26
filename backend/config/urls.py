from django.contrib import admin
from django.urls import path, include

# App routers
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]