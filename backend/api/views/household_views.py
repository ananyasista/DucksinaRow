from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth import get_user_model
from api.models import LivingPreferences
from api.serializers.household_serializers import RoommateSerializer

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def household_roommates(request):
    household = request.user.household
    if not household:
        return Response([], status=200)

    # ensure each roommate has prefs row so serializer always has data
    members = User.objects.filter(household=household).order_by("first_name", "last_name")
    for m in members:
        LivingPreferences.objects.get_or_create(user=m)

    # select_related can help a bit
    members = User.objects.filter(household=household).select_related("living_preferences")
    return Response(RoommateSerializer(members, many=True).data)