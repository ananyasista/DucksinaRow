from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

# Returns user info in approvals/event responses
class SimpleUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "first_name", "last_name", "email"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.email