import { api } from "./client";

export interface ChoreCard {
  id: string;
  title: string;
  date: string | null;
  completed: boolean;
  assignees: {
    id: string;
    name: string;
  }[];
}

export interface ChoreDetail extends ChoreCard {
  description: string;
  location: string;
  rotation_order: string[];
  created_at: string;
}

export async function chores(token: string) {
  const res = await api.get("/api/chores", {
    headers: { Authorization: `Token ${token}` },
  });
  return res.data;
}

export const getChores = async (token: string, filters?: {
  completed?: boolean;
  assignee?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get<ChoreCard[]>("/chores/", {
    headers: { Authorization: `Token ${token}` },
    params: filters,
  });

  return response.data;
};

export const getChoreById = async (token: string, id: string) => {
  const response = await api.get<ChoreDetail>(`/chores/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return response.data;
};

export const createChore = async (token: string, data: any) => {
  const response = await api.post("/chores/", data, {
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

export const deleteChore = async (token: string, id: string) => {
  await api.delete(`/chores/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getFilterOptions = async () => {
  const response = await api.get("/chores/filter-options/");
  return response.data;
};