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
  const response = await api.get<ChoreCard[]>("/chore/", {
    params: filters,
  });
  return response.data;
};

export const getChoreById = async (id: string) => {
  const response = await api.get<ChoreDetail>(`/chore/${id}/`);
  return response.data;
};

export const createChore = async (data: any) => {
  const response = await api.post("/chore/", data);
  return response.data;
};

export const updateChore = async (id: string, data: any) => {
  const response = await api.patch(`/chore/${id}/`, data);
  return response.data;
};

export const deleteChore = async (id: string) => {
  await api.delete(`/chore/${id}/`);
};

export const getChoreFilterOptions = async () => {
  const response = await api.get("/chore/filter/");
  return response.data;
};