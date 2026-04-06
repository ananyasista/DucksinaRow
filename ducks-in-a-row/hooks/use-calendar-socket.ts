import { useState, useEffect } from "react";

export const useCalendarSocket = (onCalendarUpdate: () => void) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // UPDATE WITH YOUR COMPUTER'S LOCAL IP ADDRESS to RUN PROPERLY
        const socket = new WebSocket("ws://10.138.209.82:8000/ws/household/");

        socket.onopen = () => {
            console.log("Connected to calendar WebSocket");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "calendar_updated") {
                console.log("Calendar update received:", data.payload);
                // Trigger the refresh function passed in
                onCalendarUpdate();
            }
        };

        socket.onerror = (err) => console.log("Calendar WebSocket error:", err);
        socket.onclose = () => {
            console.log("Calendar WebSocket closed");
            setIsConnected(false);
        };

        return () => socket.close();
    }, [onCalendarUpdate]);

    return { isConnected };
};