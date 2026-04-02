// hooks/useInventorySocket.ts
import { useState, useEffect } from "react";
import { InventoryDetails } from "../api/inventory"

export const useInventorySocket = () => {
    const [inventory, setInventory] = useState<InventoryDetails[]>([]);

    useEffect(() => {
        // UPDATE WITH YOUR COMPUTER'S LOCAL IP ADDRESS to RUN PROPERLY
        const socket = new WebSocket("ws://10.138.209.82:8000/ws/household/");

        socket.onopen = () => console.log("Connected to inventory WebSocket");

        socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "inventory_updated") {
            const updatedItem: InventoryDetails = data.payload;

            setInventory((prev) => {
            const index = prev.findIndex((i) => i.id === updatedItem.id);

            if (index > -1) {
                const copy = [...prev];
                copy[index] = updatedItem; // merge update
                return copy;
            } else {
                return [...prev, updatedItem]; // new item
            }
            });
        }
        };

        socket.onerror = (err) => console.log("Inventory WebSocket error:", err);
        socket.onclose = () => console.log("Inventory WebSocket closed");

        return () => socket.close();
    }, []);

    return { inventory, setInventory };
    };