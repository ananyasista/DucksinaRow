from rest_framework import serializers
from django.utils import timezone
from ..models import Items

class InventoryListSerializer(serializers.ModelSerializer):
    last_purchased_by = serializers.CharField(source='last_purchased_by.name', read_only=True)

    class Meta:
        model = Items
        fields = [
            'id',
            'household',
            'name',
            'restocked_needed',
            'quantity',
            'last_purchased_by',
            'location'
        ]

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Items
        fields = "__all__"
        read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        household = data.get("household")

        # Ensures chore belongs to the user's household
        if household != user.household:
            raise serializers.ValidationError(
                "You cannot create items for another household."
            )
        
        # Ensures assigned roommated belongs to same household
        last_purchased_by = data.get("last_purchased_by")
        if last_purchased_by and last_purchased_by.household != user.household:
                raise serializers.ValidationError(
                    "Roommate who last purchased the item must belong to your household."
                )

        return data

    def update(self, instance, validated_data):
        # Handles updating chores
        was_restock_needed = instance.restock_needed
        instance = super().update(instance, validated_data)

        return instance