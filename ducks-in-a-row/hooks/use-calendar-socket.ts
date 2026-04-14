import { useState, useEffect } from "react";
import { CalendarEvent } from "../api/calendar"

export const useCalendarSocket = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // UPDATE WITH YOUR COMPUTER'S LOCAL IP ADDRESS to RUN PROPERLY
        const socket = new WebSocket("ws://10.136.137.153:8000/ws/household/");

        socket.onopen = () => {
            console.log("Connected to calendar WebSocket");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "calendar_updated") {
                const updatedEvent: CalendarEvent = data.payload;

                setEvents((prev) => {
                    const index = prev.findIndex((e) => e.id === updatedEvent.id);

                    if (index > -1) {
                        const copy = [...prev];
                        copy[index] = updatedEvent; // merge update
                        return copy;
                    } else {
                        return [...prev, updatedEvent]; // new event
                    }
                });
            }
        };

        socket.onerror = (err) => console.log("Calendar WebSocket error:", err);
        socket.onclose = () => {
            console.log("Calendar WebSocket closed");
            setIsConnected(false);
        };

        return () => socket.close();
    }, []);

    return { events, setEvents, isConnected };
};