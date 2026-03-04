from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from api.serializers.auth_serializers import SignupSerializer, MeSerializer

User = get_user_model()

# Signup: create new user + new token 
# Returns token + user info 
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    
    # Pass incoming data into serializer for validation
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    # Create or retreive token for user
    token, _ = Token.objects.get_or_create(user=user)

    # Return token and user info
    return Response(
    {
        "token": token.key,
        "user": MeSerializer(user).data
    },
    status=status.HTTP_201_CREATED,
)

# Login: Verify email and password
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    # Gets field form JSON
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"detail": "email and password required"}, status=400)

    # authenticate() expects the field name "username" param,
    user = authenticate(request, username=email, password=password)

    # If credentials are wrong
    if user is None:
        return Response({"detail": "Invalid credentials"}, status=400)

    # If login successful, create/retrieve token 
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"token": token.key, "user": {"id": str(user.id), "email": user.email}},
        status=200,
    )

# Return current logged in user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(MeSerializer(request.user).data)