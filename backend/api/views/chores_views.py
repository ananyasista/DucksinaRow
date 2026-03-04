from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from rest_framework import viewsets
from ..serializers.chores_serializers import ChoreSerializer, ChoreListSerializer
from ..models import Chores

class ChoreViewSet(viewsets.ModelViewSet):
    # serializer_class = ChoreSerializer
    # permission_classes = [IsAuthenticated]

    # queryset = Chores.objects.all()

    # def get_serializer_class(self):
    #     if self.action == 'list':
    #         return ChoreListSerializer
    #     return ChoreDetailSerializer
    
    def get_serializer_class(self):
        if self.action == "list":
            return ChoreListSerializer
        return ChoreSerializer
    
    # READ
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Chores.objects.all()  # all chores in the table
        queryset = Chores.objects.filter(household=user.household)

        # Filter: my chores
        if self.request.query_params.get("my") == "true":
            queryset = queryset.filter(assigned_roommate=user)
        
        # Filter: Completed
        completed = self.request.query_params.get("completed")
        if completed is not None:
                if completed.lower() == "true":
                    queryset = queryset.filter(completed=True)
                elif completed.lower() == "false":
                    queryset = queryset.filter(completed=False)

        # Filter: assignee
        assignee = self.request.query_params.get("assignee")
        if assignee:
            assignee_ids = [a.strip() for a in assignee.split(",")]
            queryset = queryset.filter(assigned_roommate__id__in=assignee_ids)
        
        # Filter: Location
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Filter: Date Range
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start and end:
            queryset = queryset.filter(date__range=[start, end])
        elif start:
            queryset = queryset.filter(date__gte=start)
        elif end:
            queryset = queryset.filter(date__lte=end)

        return queryset

    def perform_create(self, serializer):
        serializer.save(household=self.request.user.household)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
