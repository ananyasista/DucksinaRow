import { api } from "./client";

export interface InventoryCard {
  id: string;
  name: string;
  restock_needed: boolean;
  quantity: number;
  details: string;
  location: string | null;
}

export interface InventoryDetails extends InventoryCard {
  last_purchased_by: {
    email: string,
    first_name: string,
    id: string
    last_name: string
    name: string
  };
  created_date: string;
  last_purchased_date: Date;
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
    params: params,
  });

  console.log(response.data);
  return response.data;
};

export const getItemById = async (id: string) => {
  const response = await api.get<InventoryDetails>(`/inventory/${id}/`);
  console.log(response.data);
  console.log(response.data.last_purchased_by);
  return response.data;
};

export const createItem = async (data: Omit<InventoryCard, "id">) => {
  console.log(data);
  const response = await api.post("/inventory/", data);
  return response.data;
};

export const updateItem = async (id: string, data: Partial<InventoryCard>) => {
  const response = await api.patch(`/inventory/${id}/`, data);
  return response.data;
};

export const deleteItem = async (id: string) => {
  await api.delete(`/inventory/${id}/`);
};

export const getInventoryFilterOptions = async () => {
  const response = await api.get("/inventory/filters/");
  return response.data;
};