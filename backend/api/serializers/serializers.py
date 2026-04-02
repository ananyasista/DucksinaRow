from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import timedelta
import datetime
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date

def ensure_aware_datetime(value, all_day=False):
    """
    Converts strings or naive datetimes into timezone-aware datetimes.
    If all_day is True, sets time to midnight.
    """
    if isinstance(value, str):
        # Try full datetime first
        dt = parse_datetime(value)
        if dt is None:
            # Parse as date-only
            d = parse_date(value)
            dt = datetime.datetime.combine(d, datetime.time.min)
    elif isinstance(value, datetime.date) and not isinstance(value, datetime.datetime):
        dt = datetime.datetime.combine(value, datetime.time.min)
    else:
        dt = value

    if all_day:
        dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)

    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)

    return dt

# USER STUFF
User = get_user_model()

# Returns user info in approvals/event responses
class SimpleUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "first_name", "last_name", "email", "display_color"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.email