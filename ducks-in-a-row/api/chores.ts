import { api } from "./client";

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
  assignee: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
    display_color?: string | null;
  };
  roommates_involved: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
    display_color?: string | null;
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
    display_color?: string | null;
  };
  pass_to_next_value: number;
  pass_to_next_unit: string;
  completed_date: Date | null;
}

interface RawChore {
  id: string;
  title: string;
  details: string;
  location: string | null;
  all_day: boolean;
  due_date: string; // string from API
  is_rotating: boolean;
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
  // ChoreDetail-only fields may or may not exist in API JSON
  completed?: boolean;
  created_at?: string;
  next_assignee?: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  };
  pass_to_next_value?: number;
  pass_to_next_unit?: string;
  completed_date?: string | null;
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
  return {
    ...raw,
    due_date: parseDate(raw.due_date)!,
    created_at: parseDate(raw.created_at),
    completed_date: parseDate(raw.completed_date) ?? null,
    completed: raw.completed ?? false,
    next_assignee: raw.next_assignee ?? { email: '', first_name: '', id: '', last_name: '', name: '' },
    pass_to_next_value: raw.pass_to_next_value ?? 0,
    pass_to_next_unit: raw.pass_to_next_unit ?? '',
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
  "id" | "assignee" | "next_assignee" | "completed_date" | "created_at" | "completed"
>;

export const createChore = async (data: ChoreCreateInput) => {
  const { roommates_involved, ...rest } = data; // pull it out
  // Format due_date correctly
  let formattedDueDate = null;
  if (data.due_date) {
    const dateObj = new Date(data.due_date);
    if (data.all_day) {
      // Only send date for all-day chores
      formattedDueDate = dateObj.toISOString().slice(0, 10); // "YYYY-MM-DD"
    } else {
      // Include full ISO datetime
      formattedDueDate = dateObj.toISOString(); // "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
  }
  const payload = {
    ...rest,
    due_date: formattedDueDate,
    roommates_involved_ids: roommates_involved?.map(r => (r.id)) ?? [],
    pass_to_next_unit: data.pass_to_next_unit?.toLowerCase(),
    location: data.location?.toLowerCase(),
  };

  // console.log(payload);

  const response = await api.post("/chore/", payload);
  return response.data;
};

export const updateChore = async (id: string, data: Partial<ChoreDetail>) => {
  // console.log(data);
  
  const { roommates_involved, ...rest } = data; // pull it out
  // Format due_date correctly
  let formattedDueDate = null;
  if (data.due_date) {
    const dateObj = new Date(data.due_date);
    if (data.all_day) {
      // Only send date for all-day chores
      formattedDueDate = dateObj.toISOString().slice(0, 10); // "YYYY-MM-DD"
    } else {
      // Include full ISO datetime
      formattedDueDate = dateObj.toISOString(); // "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
  }

  const payload = {
    ...rest,
    due_date: formattedDueDate,
    roommates_involved_ids: data.roommates_involved?.map(r => (r.id)) ?? [],
    pass_to_next_unit: data.pass_to_next_unit?.toLowerCase(),
    location: data.location?.toLowerCase()
  };

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