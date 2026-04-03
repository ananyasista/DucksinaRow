from django.urls import re_path
from .consumers import ChoreConsumer, CalendarConsumer, InventoryConsumer, UserConsumer

websocket_urlpatterns = [
    re_path(r'ws/chore/(?P<household_id>[\w-]+)/$', ChoreConsumer.as_asgi()),
    re_path(r'ws/calendar/(?P<household_id>[\w-]+)/$', CalendarConsumer.as_asgi()),
    re_path(r'ws/inventory/(?P<household_id>[\w-]+)/$', InventoryConsumer.as_asgi()),
    re_path(r'ws/users/(?P<household_id>[\w-]+)/$', UserConsumer.as_asgi()),

]