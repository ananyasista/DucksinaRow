import { endEvent } from "react-native/Libraries/Performance/Systrace";
import { api } from "./client";

export interface ChoreCard {
  id: string;
  title: string;
  details: string;
  location: string | null;
  all_day: boolean;
  due_date: Date;
  is_rotation: boolean;
  repeat_value: number;
  repeat_unit: string;
  assignee: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  };
  roommates_involved: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  }[];
}

// is_rotating = FALSE
// roommates_involved is just the creating roommate
// next_assignee is empty
// pass to values are blank

export interface ChoreDetail extends ChoreCard {
  completed: boolean;
  created_at: Date | undefined;
  next_assignee: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  };
  pass_to_next_value: number;
  pass_to_next_unit: string;
  completed_date: Date | null;
}

export const getChores = async (filters?: {
  completed?: boolean;
  assignee?: string[];
  location?: string[];
  start_date?: Date;
  end_date?: Date;
}) => {
  const params = {
    completed: filters?.completed,
    last_purchased_by: filters?.assignee?.join(","),
    location: filters?.location?.join(","),
    start_date: filters?.start_date?.toString,
    end_date: filters?.end_date?.toString,
  };

  const response = await api.get<ChoreDetail[]>("/chore/", {
    params: params,
  });
  console.log(response.data);
  return response.data;
};

export const getChoreById = async (id: string) => {
  const response = await api.get<ChoreDetail>(`/chore/${id}/`);
  console.log(response.data.repeat_value);
  console.log(response.data.pass_to_next_unit)
  return response.data;
};

export type ChoreCreateInput = Omit<
  ChoreDetail,
  "id" | "assignee" | "next_assignee" | "completed_date" | "created_at" | "completed"
>;

export const createChore = async (data: ChoreCreateInput) => {
  const response = await api.post("/chore/", data);
  return response.data;
};

export const updateChore = async (id: string, data: Partial<ChoreCard>) => {
  const response = await api.patch(`/chore/${id}/`, data);
  return response.data;
};

export const deleteChore = async (id: string) => {
  await api.delete(`/chore/${id}/`);
};

export const getChoreFilterOptions = async () => {
  const response = await api.get("/chore/filters/");
  return response.data;
};