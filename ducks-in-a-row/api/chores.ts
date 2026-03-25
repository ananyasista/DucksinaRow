import { api } from "./client";

export interface UserSummary {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  name: string;
}

export interface ChoreAssignmentDetail {
  assignee: UserSummary;
  next_assignee: UserSummary | null;
  due_date: Date;
  all_day: boolean;
  completed: boolean;
  completed_date: Date | null;
}

export interface ChoreCard {
  id: string;
  title: string;
  details: string;
  location: string | null;
  all_day: boolean;
  due_date: Date;
  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  assignee: UserSummary;
  roommates_involved: UserSummary[];
}

export interface ChoreDetail extends ChoreCard {
  completed: boolean;
  created_at: Date | undefined;
  next_assignee: UserSummary | null;
  pass_to_next_value: number;
  pass_to_next_unit: string;
  completed_date: Date | null;
  current_assignment?: ChoreAssignmentDetail;
}

// --- Raw API data ---
interface RawChore {
  id: string;
  title: string;
  details: string;
  location: string | null;
  all_day: boolean;
  due_date: string; 
  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  assignee: UserSummary;
  roommates_involved: UserSummary[];
  // Optional fields
  completed?: boolean;
  created_at?: string;
  next_assignee?: UserSummary;
  pass_to_next_value?: number;
  pass_to_next_unit?: string;
  completed_date?: string | null;
  current_assignment?: {
    assignee: UserSummary;
    next_assignee: UserSummary | null;
    due_date: string;
    all_day: boolean;
    completed: boolean;
    completed_date: string | null;
  };
}

// utils inside your API file or top of the file
function parseDate(d?: string | null, all_day = false): Date {
  if (!d) return new Date(); // fallback if API sent nothing

  if (all_day || !d.includes("T")) {
    // plain YYYY-MM-DD → Date at local midnight
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // ISO datetime
  return new Date(d);
}

function parseChore(raw: RawChore): ChoreDetail {
  const currentAssignment = raw.current_assignment
    ? {
        ...raw.current_assignment,
        due_date: parseDate(raw.current_assignment.due_date, raw.current_assignment.all_day)!,
        completed_date: parseDate(raw.current_assignment.completed_date),
      }
    : undefined;
  
  return {
    ...raw,
    due_date: parseDate(raw.due_date, raw.all_day)!,
    created_at: parseDate(raw.created_at),
    completed_date: parseDate(raw.completed_date) ?? null,
    completed: raw.completed ?? currentAssignment?.completed ?? false,
    next_assignee: raw.next_assignee ?? currentAssignment?.next_assignee ?? null,
    pass_to_next_value: raw.pass_to_next_value ?? 0,
    pass_to_next_unit: raw.pass_to_next_unit ?? "",
    current_assignment: currentAssignment,
  };
}

export const getChores = async (filters?: {
  completed?: boolean;
  assignee?: string[];
  location?: string[];
  start_date?: Date;
  end_date?: Date;
}): Promise<ChoreDetail[]> => {
  const params = {
    completed: filters?.completed,
    last_purchased_by: filters?.assignee?.join(","),
    location: filters?.location?.join(","),
    start_date: filters?.start_date?.toISOString(),
    end_date: filters?.end_date?.toISOString(),
  };

  const response = await api.get<RawChore[]>("/chore/", { params });
  // console.log(response.data);
  const chore_detail = response.data.map(parseChore);
  // console.log(chore_detail);
  return chore_detail;
};

export const getChoreById = async (id: string): Promise<ChoreDetail> => {
  const response = await api.get<RawChore>(`/chore/${id}/`);
  return parseChore(response.data);
};

export type ChoreCreateInput = Omit<
  ChoreDetail,
  "id" | "assignee" | "next_assignee" | "completed_date" | "created_at" | "completed" | "current_assignment"
>;

export const createChore = async (data: ChoreCreateInput) => {
  const { roommates_involved, ...rest } = data;
  let formattedDueDate: string | null = null;

  if (data.due_date) {
    const dateObj = new Date(data.due_date);
    formattedDueDate = data.all_day
      ? dateObj.toISOString().slice(0, 10) // all-day
      : dateObj.toISOString(); // exact time
  }

  const payload = {
    ...rest,
    due_date: formattedDueDate,
    roommates_involved_ids: roommates_involved?.map(r => r.id) ?? [],
    pass_to_next_unit: data.pass_to_next_unit?.toLowerCase(),
    location: data.location?.toLowerCase(),
  };

  const response = await api.post("/chore/", payload);
  return response.data;
};

export const updateChore = async (id: string, data: Partial<ChoreDetail>) => {
  const { roommates_involved, completed, due_date, all_day, ...rest } = data;

  let formattedDueDate: string | null = null;
  if (due_date) {
    const dateObj = new Date(due_date);
    formattedDueDate = all_day ? dateObj.toISOString().slice(0, 10) : dateObj.toISOString();
  }

  const payload: any = {
    ...rest,
    due_date: formattedDueDate,
    roommates_involved_ids: roommates_involved?.map(r => r.id) ?? [],
    pass_to_next_unit: data.pass_to_next_unit?.toLowerCase(),
    location: data.location?.toLowerCase(),
  };

  // Handle assignment updates
  if (completed !== undefined || due_date || all_day !== undefined) {
    payload.current_assignment = {};
    if (completed !== undefined) payload.current_assignment.completed = completed;
    if (due_date) payload.current_assignment.due_date = formattedDueDate;
    if (all_day !== undefined) payload.current_assignment.all_day = all_day;
  }

  const response = await api.patch(`/chore/${id}/`, payload);
  return response.data;
};

export const deleteChore = async (id: string) => {
  await api.delete(`/chore/${id}/`);
};

export const getChoreFilterOptions = async () => {
  const response = await api.get("/chore/filters/");
  return response.data;
};