from django.urls import re_path
from .consumers import ChoreConsumer, 

websocket_urlpatterns = [
    re_path(r'ws/chores/(?P<household_id>\w+)/$', ChoreConsumer.as_asgi()),
    re_path(r'ws/calendar/(?P<household_id>\w+)/$', ChoreConsumer.as_asgi()),
    re_path(r'ws/inventory/(?P<household_id>\w+)/$', ChoreConsumer.as_asgi()),
    re_path(r'ws/users/(?P<household_id>\w+)/$', ChoreConsumer.as_asgi()),

]