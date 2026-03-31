import { api } from "./client";

export interface UserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  display_color: string;
}

export interface ChoreAssignment {
  id: string;
  assignee: UserSummary;
  next_assignee: UserSummary | null;
  due_date: Date;
  completed: boolean;
  completed_date: Date | null;
  all_day: boolean;

  chore: ChoreSummary;
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
  // roommates_involved_id?: string[];
  pass_to_next_value: number | null;
  pass_to_next_unit: string | null;

  latest_assignment: ChoreAssignment;
  all_assignments: ChoreAssignment[] | [];
}

export interface ChoreSummary {
  id: string;
  title: string;
  details: string;
  location: string | null;
  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  pass_to_next_value: number | null;
  pass_to_next_unit: string | null;
  roommates_involved: UserSummary[];
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
  chore: {
    id: string;
    title: string;
    details: string;
    location: string | null;
    is_rotating: boolean;
    repeat_value: number;
    repeat_unit: string;
    pass_to_next_value: number | null;
    pass_to_next_unit: string | null;
    roommates_involved: UserSummary[];
  };
}

interface RawChore {
  id: string;
  title: string;
  details: string;
  location: string | null;
  is_rotating: boolean;
  repeat_value: number;
  repeat_unit: string;
  pass_to_next_value: number | null;
  pass_to_next_unit: string | null;
  roommates_involved: UserSummary[];
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
    chore: {
      id: raw.chore.id,
      title: raw.chore.title,
      details: raw.chore.details,
      location: raw.chore.location,
      is_rotating: raw.chore.is_rotating,
      repeat_value: raw.chore.repeat_value,
      repeat_unit: raw.chore.repeat_unit,
      pass_to_next_value: raw.chore.pass_to_next_value,
      pass_to_next_unit: raw.chore.pass_to_next_unit,
      roommates_involved: raw.chore.roommates_involved || [], // convert IDs to UserSummary if needed
    },
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
export const getChoreAssignments = async (filters?: {
  completed?: boolean;
  assignee?: string[];
  location?: string[];
  start_date?: Date;
  end_date?: Date;
}): Promise<ChoreAssignment[]> => {
  const params = {
    completed: filters?.completed === true ? "true" : filters?.completed === false ? "false" : undefined,
    assignee: filters?.assignee?.join(","),
    location: filters?.location?.join(","),
    start: filters?.start_date?.toISOString(),
    end: filters?.end_date?.toISOString(),
  };

  // Fetch raw assignments
  const response = await api.get<RawAssignment[]>("/chore-assignment/", { params });

  // Parse each raw assignment into ChoreAssignment
  return response.data.map(parseAssignment);
};

// Get a single chore by id
export const getChoreAssignmentById = async (id: string): Promise<ChoreAssignment> => {
  const response = await api.get<RawAssignment>(`/chore-assignment/${id}/`);
  console.log(response.data);
  return parseAssignment(response.data);
};

export type chorePatchPartial = Partial<Chore> &  {
  roommates_involved_ids?: string[];
}

export const buildChorePatch = (
  original: ChoreAssignment,
  current: {
    title: string;
    details: string;
    location: string | null;
    allDay: boolean;
    dueDate?: Date;
    completed?: boolean;
    repeatUnit: string;
    repeatValue: number;
    passToNextUnit: string;
    passToNextValue: number;
    isRotating: boolean;
    roommates: Chore["roommates_involved"];
  }
) => {
  const chorePatch: chorePatchPartial = {};
  const choreAssignmentPatch: Partial<ChoreAssignment> = {};

  // --- Chore-level diffs ---
  if (original.chore.title !== current.title) chorePatch.title = current.title;
  if (original.chore.details !== current.details) chorePatch.details = current.details;
  if (original.chore.location !== current.location) chorePatch.location = current.location;
  if (original.chore.is_rotating !== current.isRotating) chorePatch.is_rotating = current.isRotating;
  if (original.chore.repeat_unit !== current.repeatUnit) chorePatch.repeat_unit = current.repeatUnit;
  if (original.chore.repeat_value !== current.repeatValue) chorePatch.repeat_value = current.repeatValue;
  if (original.chore.pass_to_next_unit !== current.passToNextUnit) chorePatch.pass_to_next_unit = current.passToNextUnit;
  if (original.chore.pass_to_next_value !== current.passToNextValue) chorePatch.pass_to_next_value = current.passToNextValue;

  // --- Assignment-level diffs ---
  if (current.dueDate) {
    const originalDate = current.allDay
      ? original.due_date.toISOString().slice(0, 10)
      : original.due_date.toISOString();
    const currentDate = current.allDay
      ? current.dueDate.toISOString().slice(0, 10)
      : current.dueDate.toISOString();

    if (originalDate !== currentDate) choreAssignmentPatch.due_date = current.dueDate;
  }

  if (original.all_day !== current.allDay) choreAssignmentPatch.all_day = current.allDay;
  if (current.completed !== undefined && original.completed !== current.completed) {
    choreAssignmentPatch.completed = current.completed;
  }

  // --- Roommates check ---
  const originalIds = original.chore.roommates_involved.map(r => r.id).sort();
  const newIds = current.roommates.map(r => r.id).sort();

  if (JSON.stringify(originalIds) !== JSON.stringify(newIds)) {
    chorePatch.roommates_involved_ids = newIds;
  }

  return { chorePatch, choreAssignmentPatch };
};

export type PartialChoreUpdate = Partial<Chore> & {
  latest_assignment?: Partial<ChoreAssignment>; // allow partial assignment
}

export const updateChore = async (id: string, data: PartialChoreUpdate) => {
  // console.log("Update Chore Data: ", data);
  const response = await api.patch(`/chore/${id}/`, data);
  return parseChore(response.data);
};

// Update assignment (assignment-level)
export const updateAssignment = async (assignmentId: string, data: Partial<ChoreAssignment>) => {
  const response = await api.patch(`/chore-assignment/${assignmentId}/`, data);
  return parseAssignment(response.data);
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