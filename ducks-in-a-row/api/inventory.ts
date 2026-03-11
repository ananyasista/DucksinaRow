import { api } from "./client";

export interface InventoryCard {
  id: string;
  name: string;
  restock_needed: boolean;
  quantity: number;
  last_purchased_by: {
    id: string;
    name: string;
  }[];
}

export interface InventoryDetails extends InventoryCard {
  details: string;
  location: string;
  created_date: string;
  last_purchase_date: Date;
}

export const getInventory = async (filters?: {
  restock_needed?: boolean;
  purchased_by?: string[];
  location?: string[];
}) => {
  const params = {
    restock_needed: filters?.restock_needed,
    last_purchased_by: filters?.purchased_by?.join(","),
    location: filters?.location?.join(","),
  };
  const response = await api.get<InventoryDetails[]>("/inventory/", {
    params: filters,
  });
  return response.data;
};

export const getItemById = async (id: string) => {
  const response = await api.get<InventoryDetails>(`/inventory/${id}/`);
  return response.data;
};

export const createItem = async (data: any) => {
  const response = await api.post("/inventory/", data);
  return response.data;
};

export const updateItem = async (id: string, data: any) => {
  const response = await api.patch(`/inventory/${id}/`, data);
  return response.data;
};

export const deleteItem = async (id: string) => {
  await api.delete(`/inventory/${id}/`);
};

export const getInventoryFilterOptions = async () => {
  const response = await api.get("/inventory/filter-options/");
  return response.data;
};