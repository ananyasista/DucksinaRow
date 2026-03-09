from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import get_user_model
from api.models import LivingPreferences
from api.serializers.household_serializers import CreateHouseholdSerializer, HouseholdSerializer, RoommateSerializer

User = get_user_model()


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_household_name(request):
    household = request.user.household
    if not household:
        return Response({"detail": "No household found."}, status=404)

    name = request.data.get("household_name", "").strip()
    if not name:
        return Response({"detail": "household_name is required."}, status=400)

    household.household_name = name
    household.save()
    return Response({"household_name": household.household_name})


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

@api_view(["POST"])
@permission_classes([IsAuthenticated])  
def create_household(request):
    serializer = CreateHouseholdSerializer(
        data=request.data,
        context={"request": request}
    )

    if serializer.is_valid():
        household = serializer.save()
        return Response(HouseholdSerializer(household).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)