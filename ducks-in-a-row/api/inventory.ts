import { api } from "./client";

export interface InventoryCard {
  id: string;
  name: string;
  restock_needed: boolean;
  quantity : string;
  last_purchased_by: {
    id: string;
    name: string;
  }[];
}

export interface InventoryDetails extends InventoryCard {
  details: string;
  location: string;
  created_date: string;
  last_purchase_date: string | null;
}

export async function inventory(token: string) {
  const res = await api.get("/api/inventory", {
    headers: { Authorization: `Token ${token}` },
  });
  return res.data;
}

export const getInventory = async (token: string, filters?: {
  restock_needed?: boolean;
  purchased_by?: string;
  location?: string;
}) => {
  const response = await api.get<InventoryCard[]>("/inventory/", {
    headers: { Authorization: `Token ${token}` },
    params: filters,
  });

  return response.data;
};

export const getItemById = async (token: string, id: string) => {
  const response = await api.get<InventoryDetails>(`/inventory/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

export const createItem = async (token: string, data: any) => {
  const response = await api.post("/inventory/", data, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

export const updateChore = async (token: string, id: string, data: any) => {
  const response = await api.patch(`/chores/${id}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

export const deleteItem = async (token: string, id: string) => {
  await api.delete(`/inventory/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getInventoryFilterOptions = async () => {
  const response = await api.get("/inventory/filter-options/");
  return response.data;
};