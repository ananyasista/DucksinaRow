import { api } from "./client";

export type LivingPreferences = {
  cleanliness: number | null;
  clean_up_your_space: boolean;
  cook: boolean;
  sharing_items: boolean;
  pets: boolean;
  guests: boolean;
  personality_type: string;
  sleep_schedule: string;
  smoking: boolean;
  drinking_alcohol: boolean;
};

export type Roommate = {
  id: string;
  full_name: string;
  email: string;
  living_preferences: LivingPreferences;
};

export async function getHouseholdRoommates(): Promise<Roommate[]> {
  const res = await api.get("/household/roommates/");
  return res.data;
}