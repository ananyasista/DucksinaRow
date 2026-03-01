from rest_framework import serializers
from .models import Chore

class ChoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chore
        field = "__all__"
        read_only_fields = ("id", "household")

    def validate(self, data):
        user = self.context["request"].user
        household = data.get("household")

        # Ensures chore belongs to the user's household
        if household != user.household:
            raise serializer.ValidationError(
                "You cannot create chores for another household."
            )
        
        # Ensures assigned roommated belongs to same household
        assigned = data.get("assigned_roommate")
        if assigned and assigned.household != user.household:
                raise serializer.ValidationError(
                    "Assigned roommate must belong to your household."
                )
        
        # Rotation Logic
        if data.get("is_rotating") and not data.get("roommates_involved"):
            raise serializers.ValidationError(
                "Rotating chores must include roommates."
            )

        # Notification Logic
        if data.get("notification_unit") and not data.get("notification_value"):
            raise serializers.ValidationError(
                "Notification value required if unit is set."
            )

        return data

    def update(self, instance, validated_data):
        # Handles updating chores
        was_complete = instance.completed
        instance = super().update(instance, validated_data)

        # was complete
        if not was_complete and instance.compeleted:
                # Rotate only if deadline has passed
                if instance.date <= timezone.now().date():
                    instance.rotate()
        
        return instance

# Rotation HELPER method
def rotate_chore(self):
    # Moves chore to next assignee in rotation

    if not self.is_rotating:
        return
    
    roommate = list(self.roommates_involved.all())
    if not roommates:
        return
    
    if self.assigned_roommate in roommates:
        index = roommate.index(self.assigned_roommate)
        next_index = (index + 1) % len(roommates)
        self.assigned_roommate = roommates[next_index]
    else:
        self.assigned_roommate = roommates[0]
    
    self.completed = False
    self.save()

# Attach rotation method
Chores.rotate = rotate_chore