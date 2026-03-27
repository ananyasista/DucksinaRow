from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from django.db.models import Q, Case, When, IntegerField, BooleanField, ExpressionWrapper, OuterRef, Subquery
from django.utils import timezone

from ..models import Chore, ChoreAssignment, User
from ..serializers.chores_serializers import (
    ChoreSerializer,
    ChoreAssignmentSerializer
)

# CHORE VIEWSET (TEMPLATE to make chores)
class ChoreViewSet(viewsets.ModelViewSet):
    serializer_class = ChoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Chore.objects.all()

        if not user.is_superuser:
            qs = qs.filter(household=user.household)

        # Subquery to get the latest assignment per chore
        latest_assignment = ChoreAssignment.objects.filter(
            chore=OuterRef('pk')
        ).order_by('-due_date')  # assuming latest = most recent due_date

        qs = qs.annotate(
            latest_assignee_id=Subquery(latest_assignment.values('assignee_id')[:1]),
            latest_due_date=Subquery(latest_assignment.values('due_date')[:1]),
            latest_completed=Subquery(latest_assignment.values('completed')[:1]),
        )

        # Now filter using these annotated fields
        completed = self.request.query_params.get("completed")
        if completed is not None:
            if completed.lower() == "true":
                qs = qs.filter(latest_completed__in=[True, False])
            elif completed.lower() == "false":
                qs = qs.filter(latest_completed=False)

        assignee = self.request.query_params.get("assignee")
        if assignee:
            qs = qs.filter(latest_assignee_id__in=[a for a in assignee.split(",")])
        
        locations = self.request.query_params.get("location")
        if locations:
            location_list = [loc.strip() for loc in locations.split(",")]
            qs = qs.filter(location__in=location_list)

        start = self.request.query_params.get("start")
        if start:
            qs = qs.filter(latest_due_date__gte=start)
        end = self.request.query_params.get("end")
        if end:
            qs = qs.filter(latest_due_date__lte=end)

        return qs

    def perform_create(self, serializer):
        serializer.save(household=self.request.user.household)
   
    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()
        chore = assignment.chore  # reference the parent chore
        assignment.delete()       # delete this assignment

        # If no more assignments remain, delete the chore
        if not chore.assignments.exists():
            chore.delete()

# CHORE ASSIGNMENT VIEWSET (MAIN LOGIC)
class ChoreAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ChoreAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()

        queryset = ChoreAssignment.objects.select_related(
            "chore", "assignee", "chore__household"
        )

        if not user.is_superuser:
            queryset = queryset.filter(chore__household=user.household)

        # COMPLETION LOGIC
        completed = self.request.query_params.get("completed")
        if completed is None:
            # Default: only incomplete, future/present assignments
            queryset = queryset.filter(completed=False, due_date__gte=now)
        elif completed.lower() == "true":
            # Include incomplete future + all completed
            queryset = queryset.filter(
                Q(completed=False, due_date__gte=now) | Q(completed=True)
            )
        elif completed.lower() == "false":
            queryset = queryset.filter(completed=False)

        # My assignments
        if self.request.query_params.get("my") == "true":
            queryset = queryset.filter(assignee=user)

        # Assignee filter (multi-select)
        assignee = self.request.query_params.get("assignee")
        if assignee:
            queryset = queryset.filter(
                assignee__id__in=[int(a.strip()) for a in assignee.split(",")]
            )

        # Location (from chore)
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(chore__location__icontains=location)

        # Date filters
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start and end:
            queryset = queryset.filter(due_date__range=[start, end])
        elif start:
            queryset = queryset.filter(due_date__gte=start)
        elif end:
            queryset = queryset.filter(due_date__lte=end)

        # Sorting: overdue first, incomplete before complete
        queryset = queryset.annotate(
            completion_order=Case(
                When(completed=False, then=0),
                When(completed=True, then=1),
                output_field=IntegerField()
            ),
            is_overdue=ExpressionWrapper(
                Q(due_date__lt=now) & Q(completed=False),
                output_field=BooleanField()
            )
        ).order_by(
            "-is_overdue",
            "completion_order",
            "due_date"
        )

        return queryset

    def perform_update(self, serializer):
        instance = self.get_object()
        was_complete = instance.completed
        updated_instance = serializer.save()

        # Rotate if just marked complete
        if not was_complete and updated_instance.completed:
            if hasattr(updated_instance, "create_next_assignment"):
                updated_instance.create_next_assignment()

    # Optional: filters endpoint
    @action(detail=False, methods=["get"], url_path="filters")
    def filters(self, request):
        user = request.user
        queryset = ChoreAssignment.objects.select_related("chore")
        if not user.is_superuser:
            queryset = queryset.filter(chore__household=user.household)

        locations = queryset.exclude(
            chore__location__isnull=True
        ).exclude(
            chore__location=""
        ).values_list("chore__location", flat=True).distinct()

        roommates = User.objects.filter(
            household=user.household
        ).values("id", "first_name")

        return Response({
            "locations": list(locations),
            "completed_options": [
                {"value": True, "label": "Completed"},
                {"value": False, "label": "Incomplete"},
            ],
            "roommates": [{"label": u["first_name"], "value": u["id"]} for u in roommates],
        })