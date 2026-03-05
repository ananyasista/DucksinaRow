from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from api.models import LivingPreferences
from api.serializers.preferences_serializers import LivingPreferencesSerializer

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def my_living_preferences(request):
    prefs, _ = LivingPreferences.objects.get_or_create(user=request.user) # first time user hits GET or PATCH

    if request.method == "GET":
        return Response(LivingPreferencesSerializer(prefs).data)

    # PUT/PATCH update
    serializer = LivingPreferencesSerializer(prefs, data=request.data, partial=(request.method == "PATCH"))
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)