from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

# Validates input and creates user
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "password")

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]  # use email as username
        
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)   # hashes password
        user.save()
        return user

    
class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "household")