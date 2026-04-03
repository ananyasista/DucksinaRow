import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChoreConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.household_id = self.scope["url_route"]["kwargs"]["household_id"]
        self.room_group_name = f"household_{self.household_id}"

        await self.channel_layers.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Called when backend sends events
    async def chore_updated(self, event):
        # event['payload'] contains serialized Chore data
        await self.send_json({
            "type": "chore_updated",
            "payload": event['payload']
        })

    async def assignment_updated(self, event):
        # event['payload'] contains serialized Assignment data
        await self.send_json({
            "type": "assignment_updated",
            "payload": event['payload']
        })

class CalendarConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.household_id = self.scope["url_route"]["kwargs"]["household_id"]
        self.room_group_name = f"household_{self.household_id}"

        await self.channel_layers.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Called when backend sends events
    async def calendar_updated(self, event):
        # event['payload'] contains serialized Calendar data
        await self.send_json({
            "type": "calendar_updated",
            "payload": event['payload']
        })

class InventoryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.household_id = self.scope["url_route"]["kwargs"]["household_id"]
        self.room_group_name = f"household_{self.household_id}"

        await self.channel_layers.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Called when backend sends events
    async def inventory_updated(self, event):
        # event['payload'] contains serialized inventory data
        await self.send_json({
            "type": "inventory_updated",
            "payload": event['payload']
        })

class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.household_id = self.scope["url_route"]["kwargs"]["household_id"]
        self.room_group_name = f"household_{self.household_id}"

        await self.channel_layers.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Called when backend sends events
    async def user_updated(self, event):
        # event['payload'] contains serialized user data
        await self.send_json({
            "type": "chore_updated",
            "payload": event['payload']
        })