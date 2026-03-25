from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from ..serializers.chores_serializers import ChoreSerializer, ChoreAssignmentSerializer
from ..models import Chore, User, ChoreAssignment


class ChoreViewSet(viewsets.ModelViewSet):
    serializer_class = ChoreSerializer
    queryset = Chore.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Chore.objects.all()
        queryset = Chore.objects.filter(household=user.household)

        # Optional filters
        if self.request.query_params.get("my") == "true":
            queryset = queryset.filter(assignments__assignee=user).distinct()
        completed = self.request.query_params.get("completed")
        if completed is not None:
            queryset = queryset.filter(assignments__completed=(completed.lower() == "true")).distinct()
        assignee = self.request.query_params.get("assignee")
        if assignee:
            queryset = queryset.filter(assignments__assignee__id__in=[a.strip() for a in assignee.split(",")]).distinct()
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)
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
        chores = Chore.objects.all() if user.is_superuser else Chore.objects.filter(household=user.household)
        locations = chores.exclude(location__isnull=True).exclude(location="").values_list("location", flat=True).distinct()
        roommates_qs = User.objects.filter(household=user.household).exclude(id__isnull=True).values("id", "first_name")
        data = {
            "locations": list(locations),
            "completed_options": [{"value": True, "label": "Completed"}, {"value": False, "label": "Incomplete"}],
            "roommates": [{"label": u["first_name"], "value": u["id"]} for u in roommates_qs],
        }
        return Response(data)

    # PATCH / PUT support for nested assignment
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # partial=True allows PATCH with only the fields you want to update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


# For Admin Purposes
class ChoreAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ChoreAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ChoreAssignment.objects.select_related("chore", "assignee", "chore__household")
        if not user.is_superuser:
            queryset = queryset.filter(assignee=user)  # only user's assignments

        # Filters
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

    def perform_update(self, serializer):
        instance = self.get_object()
        was_complete = instance.completed
        updated_instance = serializer.save()
        if updated_instance.completed:
            updated_instance.create_next_assignment()