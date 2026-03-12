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
  event_owner_name?: {
    id: string;
    full_name: string;
    email: string;
  };
  notification_value?: number | null;
  notification_unit?: string | null;
  approval_status?: "approved"|"pending"|"declined";
  approval_counts?: {
    approved:number;
    total: number;
  }
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
  };
  approved: boolean;
  response_time?: string | null;
}

// All events in the current user's household
export async function listHouseholdEvents(): Promise<CalendarEvent[]> {
  const res = await api.get("/calendar/events/");
  return res.data;
}

export async function getEventId(id: string): Promise<EventDetails> {
  const response = await api.get(`/calendar/events/${id}/`);
  return response.data;
};

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

export async function createEvent(payload: Partial<CalendarEvent>) {
  const res = await api.post("/calendar/events/", payload);
  return res.data;
}

export async function updateEvent(eventId: string, patch: Partial<CalendarEvent>) {
  const res = await api.patch(`/calendar/events/${eventId}/`, patch);
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