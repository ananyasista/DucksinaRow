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
  notification_value?: number | null;
  notification_unit?: string | null;
}

export async function listEvents(): Promise<CalendarEvent[]> {
  const res = await api.get("/calendar/events/");
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

export async function listEventApprovals(eventId: string) {
  const res = await api.get(`/calendar/events/${eventId}/approvals/`);
  return res.data;
}

export async function needsApproval(): Promise<CalendarEvent[]> {
  const res = await api.get("/calendar/events/approvals/pending/");
  return res.data;
}

export async function respondApproval(eventId: string, approved: boolean) {
  const res = await api.post("/calendar/events/approvals/respond/", {
    event_id: eventId,
    approved,
  });
  return res.data;
}

export async function deleteEvent(eventId: string) {
  await api.delete(`/calendar/events/${eventId}/`);
}