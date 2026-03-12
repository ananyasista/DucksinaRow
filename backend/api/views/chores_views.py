from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.utils import timezone

from rest_framework import viewsets
from ..serializers.chores_serializers import ChoreSerializer, ChoreAssignmentSerializer
from ..models import Chore, User, ChoreAssignment

class ChoreViewSet(viewsets.ModelViewSet):
    serializer_class = ChoreSerializer
    queryset = Chore.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        # if self.action == "list":
        #     return ChoreListSerializer
        return ChoreSerializer
    
    # READ
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Chore.objects.all()  # all chores in the table
        queryset = Chore.objects.filter(household=user.household)

        # Filter: my chores
        if self.request.query_params.get("my") == "true":
            queryset = queryset.filter(assignments__assignee=user).distinct()
        
        # Filter: Completed
        completed = self.request.query_params.get("completed")
        if completed is not None:
                if completed.lower() == "true":
                    queryset = queryset.filter(assignments__completed=(completed.lower() == "true")).distinct()
                elif completed.lower() == "false":
                    queryset = queryset.filter(assignments__completed=(completed.lower() == "false")).distinct()

        # Filter: assignee
        assignee = self.request.query_params.get("assignee")
        if assignee:
            assignee_ids = [a.strip() for a in assignee.split(",")]
            queryset = queryset.filter(assignments__assignee__id__in=assignee_ids).distinct()
        
        # Filter: Location
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Filter: Date Range
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start and end:
            queryset = queryset.filter(assignments__due_date__range=[start, end]).distinct()
        elif start:
            queryset = queryset.filter(assignments__due_date__gte=start).distinct()
        elif end:
            queryset = queryset.filter(assignments__due_date__lte=end).distinct()
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

        # Base queryset
        if user.is_superuser:
            chores = Chore.objects.all()
        else:
            chores = Chore.objects.filter(household=user.household)

        # Unique locations (exclude null and empty)
        locations = chores.exclude(location__isnull=True).exclude(location="").values_list("location", flat=True).distinct()

        # Roommates in household (exclude users without household)
        roommates_qs = User.objects.filter(household=user.household).exclude(id__isnull=True).values("id", "first_name")

        data = {
            "locations": list(locations),
            "completed_options": [
                {"value": True, "label": "Completed"},
                {"value": False, "label": "Incomplete"},
            ],
            "roommates": [{"label": u["first_name"], "value": u["id"]} for u in roommates_qs],
        }

        return Response(data)
    
    def perform_update(self, serializer):
        instance = self.get_object()
        was_complete = instance.completed

        updated_instance = serializer.save()

        # IF JUST COMPLETED → CREATE NEXT ASSIGNMENT
        if not was_complete and updated_instance.completed:
            updated_instance.create_next_assignment()

# For Admin Purposes
class ChoreAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ChoreAssignment.objects.all().select_related("chore", "assignee", "chore__household")
    serializer_class = ChoreAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Superusers can see everything
        if not user.is_superuser:
            # Limit to assignments in user's household
            queryset = queryset.filter(chore__household=user.household)

        # Optional filters
        assignee = self.request.query_params.get("assignee")
        if assignee:
            queryset = queryset.filter(assignee__id=assignee)

        completed = self.request.query_params.get("completed")
        if completed is not None:
            queryset = queryset.filter(completed=(completed.lower() == "true"))

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start and end:
            queryset = queryset.filter(due_date__range=[start, end])
        elif start:
            queryset = queryset.filter(due_date__gte=start)
        elif end:
            queryset = queryset.filter(due_date__lte=end)

        return queryset