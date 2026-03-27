import { api } from "./client";

export interface UserSummary {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  name: string;
}

export interface ChoreAssignment {
  id: string;
  assignee: UserSummary;
  next_assignee: UserSummary | null;
  due_date: Date;
  completed: boolean;
  completed_date: Date;
  all_day: boolean;
}

export interface Chore {
  id: string;
  title: string;
  details: string;
  location: string | null;

  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  roommates_involved: UserSummary[];
  pass_to_next_value: number | null;
  pass_to_next_unit: string | null;

  latest_assignment: Partial<ChoreAssignment>;
  all_assignments: ChoreAssignment[] | [];
}

// --- Raw API type ---
interface RawAssignment {
  id: string;
  assignee: UserSummary;
  next_assignee: UserSummary | null;
  due_date: string;
  completed: boolean;
  completed_date: string | null;
  all_day: boolean;
}

interface RawChore {
  id: string;
  title: string;
  details: string;
  location: string | null;
  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  roommates_involved: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
    name: string,
  }[];
  pass_to_next_value: number | null;
  pass_to_next_unit: string | null;

  latest_assignment: RawAssignment;
  all_assignments: RawAssignment[];
}

// Utils functions
function parseDate(d?: string | null, all_day = false): Date {
  if (!d) return new Date();

  if (all_day) {
    const [year, month, day] = d.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(d);
}

function parseAssignment(raw: RawAssignment): ChoreAssignment {
  return {
    ...raw,
    due_date: parseDate(raw.due_date, raw.all_day),
    completed_date: parseDate(raw.completed_date),
  };
}

function parseChore(raw: RawChore): Chore {
  return {
    ...raw,
    latest_assignment: parseAssignment(raw.latest_assignment),
    all_assignments: raw.all_assignments.map(parseAssignment),
    roommates_involved: raw.roommates_involved ?? [],
  };
}

// --- API calls ---
export const getChores = async (filters?: {
  completed?: boolean;
  assignee?: string[];
  location?: string[];
  start_date?: Date;
  end_date?: Date;
}): Promise<Chore[]> => {
  const params = {
    completed: filters?.completed === true ? "true" : filters?.completed === false ? "false" : undefined,
    assignee: filters?.assignee?.join(","),
    location: filters?.location?.join(","),
    start: filters?.start_date?.toISOString(),
    end: filters?.end_date?.toISOString(),
  };

  const response = await api.get<RawChore[]>("/chore/", { params });
  return response.data.map(parseChore);
};

export const getChoreById = async (id: string): Promise<Chore> => {
  const response = await api.get<RawChore>(`/chore/${id}/`);
  console.log(response.data.latest_assignment.due_date);
  return parseChore(response.data);
};

export const buildChorePatch = (original: Chore, current: {
  title: string;
  details: string;
  location: string | null;
  allDay: boolean;
  dueDate: Date;
  repeatUnit: string;
  repeatValue: number;
  passToNextUnit: string;
  passToNextValue: number;
  isRotating: boolean;
  roommates: Chore["roommates_involved"];
}) => {
  const payload: any = {};

  if (original.title !== current.title) payload.title = current.title;
  if (original.details !== current.details) payload.details = current.details;
  if (original.location !== current.location) payload.location = current.location;

  if (original.is_rotating !== current.isRotating) {
    payload.is_rotating = current.isRotating;
  }

  if (original.repeat_unit !== current.repeatUnit) {
    payload.repeat_unit = current.repeatUnit;
  }

  if (original.repeat_value !== current.repeatValue) {
    payload.repeat_value = current.repeatValue;
  }

  if (original.pass_to_next_unit !== current.passToNextUnit) {
    payload.pass_to_next_unit = current.passToNextUnit;
  }

  if (original.pass_to_next_value !== current.passToNextValue) {
    payload.pass_to_next_value = current.passToNextValue;
  }

  // Assignment diff
  const originalAssignment = original.latest_assignment;

  if (current.dueDate) {
    const originalDate = originalAssignment.due_date
      ? new Date(originalAssignment.due_date).toISOString()
      : null;

    const currentDate = current.allDay
      ? current.dueDate.toISOString().slice(0, 10)
      : current.dueDate.toISOString();

    if (originalDate !== currentDate) {
      payload.due_date = currentDate;
    }
  }

  if (originalAssignment.all_day !== current.allDay) {
    payload.all_day = current.allDay;
  }

  // Roommates diff
  const originalIds = original.roommates_involved.map(r => r.id).sort();
  const newIds = current.roommates.map(r => r.id).sort();

  if (JSON.stringify(originalIds) !== JSON.stringify(newIds)) {
    payload.roommates_involved_ids = newIds;
  }

  return payload;
};

export type PartialChoreUpdate = Partial<Chore> & {
  latest_assignment?: Partial<ChoreAssignment>; // allow partial assignment
}

export const updateChore = async (id: string, data: PartialChoreUpdate) => {
  console.log("INITIAL DATA: ", data);

  const response = await api.patch(`/chore/${id}/`, data);
  return parseChore(response.data); // always parse nested assignments
};

export type ChoreCreateInput = Omit<
  Chore,
  "id" | "latest_assignment" | "all_assignments"
> & {
  due_date?: string | Date;
  all_day?: boolean;
  latest_assignment?: never;
};

export const createChore = async (data: ChoreCreateInput) => {
  console.log("INITIAL CREATE:", data);

  // Format due_date if provided
  // Format due_date if provided
  let formattedDueDate: string | null = null;
  if (data.due_date) {
    const dateObj = new Date(data.due_date);
    formattedDueDate = data.all_day ? dateObj.toISOString().slice(0, 10) : dateObj.toISOString();
  }

  const payload = {
    ...data,
    due_date: formattedDueDate,
    roommates_involved_ids: data.roommates_involved?.map(r => r.id) ?? [],
  };

  console.log("CREATE DATA", payload);

  const response = await api.post("/chore/", payload);
  return parseChore(response.data);
};

export const deleteChoreAssignment = async (assignmentId: string) => {
  await api.delete(`/chore-assignment/${assignmentId}/`);
};

export const getAssignmentFilterOptions = async () => {
  const response = await api.get("/chore-assignment/filters/");
  return response.data;
};