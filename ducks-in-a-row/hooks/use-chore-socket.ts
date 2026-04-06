import { useState, useEffect } from "react";
import { ChoreAssignment } from "../api/chores"

export const useChoreSocket = () => {
    const [chores, setChores] = useState<ChoreAssignment[]>([]);

    useEffect(() => {
                // UPDATE WITH YOUR COMPUTER'S LOCAL IP ADDRESS to RUN PROPERLY
        const socket = new WebSocket("ws://10.138.250.29:8000/ws/household/");

        socket.onopen = () => console.log("Connected to chore WebSocket");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "chore_updated" || data.type === "assignment_updated") {
                const updatedChore: ChoreAssignment = data.payload;

                setChores((prev) => {
                    const index = prev.findIndex((c) => c.id === updatedChore.id);

                    if (index > -1) {
                        const copy = [...prev];
                        copy[index] = updatedChore; // merge update
                        return copy;
                    } else {
                        return [...prev, updatedChore]; // new chore
                    }
                });
            } else if (data.type === "chore_deleted") {
                const deletedChoreId = data.payload?.id;
                setChores((prev) => prev.filter((c) => c.id !== deletedChoreId));
            }
        };

        socket.onerror = (err) => console.log("Chore WebSocket error:", err);
        socket.onclose = () => console.log("Chore WebSocket closed");

        return () => socket.close();
    }, []);

    return { chores, setChores };
};