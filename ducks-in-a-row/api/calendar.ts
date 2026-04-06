import { api } from "./client";

export interface CalendarEvent {
  id: string;
  title: string;
  details?: string;
  all_day: boolean;
  start_date: string;
  end_date?: string | null;
  repeat: string;
  requires_approval: boolean; 
  location?: string;
  event_owner_name: string;
  display_color?: string | null;
  notification_value?: number | null;
  notification_unit?: string | null;
  approval_status?: "approved" | "pending" | "declined";
  approval_counts?: {
    approved: number;
    total: number;
  };
}

export interface ApprovalUser {
  id: string;
  name: string;
  email: string;
}

export interface ApprovalRow {
  user: ApprovalUser;
  approved: boolean;
  response_time?: string | null;
  status: "approved" | "pending" | "declined";
}

export interface EventDetails extends CalendarEvent {
  approvals: ApprovalRow[];
}

export interface ApprovalEvent {
  id: string;
  event: {
    id: string;
    title: string;
    start_date: string;
    end_date?: string | null;
    location?: string;
    event_owner_name?: string;
    requires_approval: boolean;
    display_color?: string | null;
  };
  approved: boolean;
  response_time?: string | null;
}

export type CalendarEventCreateInput = Omit<
  CalendarEvent,
  "id" | "event_owner_name" | "approval_status" | "approval_counts"
>;

export type CalendarFilterOptions = {
  mine?: boolean;
  month?: number;
  year?: number;
  owners?: string[]; // roommate user IDs
};

// All events in the current user's household > Full Calendar View 
export async function listHouseholdEvents(): Promise<CalendarEvent[]> {
  const res = await api.get("/calendar/events/");
  return res.data;
}

// Filtered household events
export async function getFilterOptions(
  filters: CalendarFilterOptions = {}
): Promise<CalendarEvent[]> {
  const params: Record<string, string> = {};

  if (filters.mine) {
    params.mine = "true";
  }

  if (filters.month !== undefined) {
    params.month = String(filters.month);
  }

  if (filters.year !== undefined) {
    params.year = String(filters.year);
  }

  if (filters.owners && filters.owners.length > 0) {
    params.owners = filters.owners.join(",");
  }

  const res = await api.get("/calendar/events/", { params });
  return res.data;
}

// One event detail
export async function getEventId(id: string): Promise<EventDetails> {
  const response = await api.get(`/calendar/events/${id}/`);
  return response.data;
}

// All events created by the current user > "Your Events" section
export async function listMyEvents(): Promise<CalendarEvent[]> {
  const res = await api.get("/calendar/events/my-events/");
  return res.data;
}

// Events that still need the current user's approval > "Needs Approval" section
export async function listNeedsApproval(): Promise<ApprovalEvent[]> {
  const res = await api.get("/calendar/events/needs-approval/");
  return res.data;
}

export async function createEvent(data: CalendarEventCreateInput) {
  let formattedStartDate = data.start_date;
  let formattedEndDate = data.end_date ?? null;

  if (data.start_date) {
    const startObj = new Date(data.start_date);
    formattedStartDate = data.all_day
      ? startObj.toISOString()
      : startObj.toISOString();
  }

  if (data.end_date) {
    const endObj = new Date(data.end_date);
    formattedEndDate = data.all_day
      ? endObj.toISOString()
      : endObj.toISOString();
  }

  const payload = {
    ...data,
    start_date: formattedStartDate,
    end_date: formattedEndDate,
  };

  const res = await api.post("/calendar/events/", payload);
  return res.data;
}

export async function updateEvent(
  eventId: string,
  patch: Partial<CalendarEventCreateInput>
) {
  const payload = { ...patch };

  if (patch.start_date) {
    payload.start_date = new Date(patch.start_date).toISOString();
  }

  if (patch.end_date) {
    payload.end_date = new Date(patch.end_date).toISOString();
  }

  const res = await api.patch(`/calendar/events/${eventId}/`, payload);
  return res.data;
}

export async function respondApproval(eventId: string, approved: boolean) {
  const action = approved ? "approve" : "decline";

  const res = await api.post(`/calendar/events/${eventId}/respond/`, {
    action,
  });

  return res.data;
}

export async function deleteEvent(eventId: string) {
  await api.delete(`/calendar/events/${eventId}/`);
}