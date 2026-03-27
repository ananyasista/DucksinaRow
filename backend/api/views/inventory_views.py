from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.utils import timezone

from rest_framework import viewsets
from ..serializers.inventory_serializers import InventoryListSerializer, InventorySerializer
from ..models import Items, User

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Items.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return InventoryListSerializer
        return InventorySerializer
    
    # READ
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Items.objects.all()  # all items in the table
        queryset = Items.objects.filter(household=user.household)
        
        # Filter: Restock Needed
        restock_needed = self.request.query_params.get("restock_needed")
        if restock_needed is not None:
                if restock_needed.lower() == "true":
                    queryset = queryset.filter(restock_needed__in=[True, False])
                elif restock_needed.lower() == "false":
                    queryset = queryset.filter(restock_needed=False)

        # Filter: Last Purchased By
        purchased_by = self.request.query_params.get("last_purchased_by")
        if purchased_by:
            purchased_by_ids = [p.strip() for p in purchased_by.split(",")]
            queryset = queryset.filter(last_purchased_by__id__in=purchased_by_ids)
        
        # Filter: Location
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset

    def perform_create(self, serializer):
        serializer.save(household=self.request.user.household)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=["get"], url_path="filters")
    def filters(self, request):
        user = request.user

        # Base queryset (respect household rules)
        if user.is_superuser:
            items = Items.objects.all()
        else:
            items = Items.objects.filter(household=user.household)

        # Unique locations
        locations = (
            items.exclude(location="")
            .values_list("location", flat=True)
            .distinct()
        )

        # Roommates in this household
        roommates = User.objects.filter(
            household=user.household
        ).values("id", "first_name")

        data = {
            "locations": list(locations),
            "restock": [
                {"value": True, "label": "Need Restock"},
                {"value": False, "label": "Stocked"},
            ],
            "purchased_by": [
                {"label": u["first_name"], "value": u["id"]} for u in roommates
            ],
        }

        return Response(data)