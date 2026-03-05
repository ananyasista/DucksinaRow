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

export const getChores = async (filters?: {
  completed?: boolean;
  assignee?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get<ChoreCard[]>("/chores/", {
    params: filters,
  });
  return response.data;
};

export const getChoreById = async (id: string) => {
  const response = await api.get<ChoreDetail>(`/chores/${id}/`);
  return response.data;
};

export const createChore = async (data: any) => {
  const response = await api.post("/chores/", data);
  return response.data;
};

export const updateChore = async (id: string, data: any) => {
  const response = await api.patch(`/chores/${id}/`, data);
  return response.data;
};

export const deleteChore = async (id: string) => {
  await api.delete(`/chores/${id}/`);
};

export const getFilterOptions = async () => {
  const response = await api.get("/chores/filters/");
  return response.data;
};