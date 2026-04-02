from rest_framework import serializers
from django.utils import timezone
from ..models import Items
from .serializers import SimpleUserSerializer, User
from ..serializers.serializers import ensure_aware_datetime
import datetime

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class InventoryListSerializer(serializers.ModelSerializer):
    last_purchased_by = SimpleUserSerializer(read_only=True)
    last_purchased_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="last_purchased_by",
        write_only=True,
        required=False
    )

    class Meta:
        model = Items
        fields = [
            'id',
            'household',
            'name',
            'restock_needed',
            'quantity',
            'last_purchased_by',
            "last_purchased_by_id",
            'location'
        ]

    read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        last_purchased_by = data.get("last_purchased_by")
        if last_purchased_by and last_purchased_by.household != user.household:
            raise serializers.ValidationError(
                "Roommate who last purchased the item must belong to your household."
            )
        return data
    
    

class InventorySerializer(serializers.ModelSerializer):
    last_purchased_by = SimpleUserSerializer(read_only=True)
    last_purchased_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="last_purchased_by",
        write_only=True,
        required=False
    )

    class Meta:
        model = Items
        fields = "__all__"
        read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        household = data.get("household")
        
        # Ensures assigned roommated belongs to same household
        last_purchased_by = data.get("last_purchased_by")
        if last_purchased_by and last_purchased_by.household != user.household:
                raise serializers.ValidationError(
                    "Roommate who last purchased the item must belong to your household."
                )

        return data

    def create(self, validated_data):
        # Auto-set the current user
        user = self.context["request"].user
        validated_data["last_purchased_by"] = user
        validated_data["last_purchased_date"] = timezone.now().date()

        # Also set household if needed
        if "household" not in validated_data:
            validated_data["household"] = user.household

        item = super().create(validated_data)

        broadcast_inventory_update(item)

        return item
    
    def update(self, instance, validated_data):
        was_restock_needed = instance.restock_needed

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If item was restocked
        if was_restock_needed and not instance.restock_needed:
            instance.last_purchased_date = ensure_aware_datetime(datetime.datetime.now(), False)
            print("ADDED DATE: ", instance.last_purchased_date)
            instance.last_purchased_by = self.context["request"].user
            instance.save(update_fields=["last_purchased_date", "last_purchased_by"])
        
        broadcast_inventory_update(instance)
        
        return instance

def broadcast_inventory_update(item):
    channel_layer = get_channel_layer()

    print("SENDING ITEM DATA....", item)
    print(InventorySerializer(item).data)

    async_to_sync(channel_layer.group_send)(
        f"household_{item.household_id}",
        {
            "type": "inventory_updated",
            "payload": InventorySerializer(item).data
        }
    )