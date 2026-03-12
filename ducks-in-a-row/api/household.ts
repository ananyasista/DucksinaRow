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
  first_name: string;
  last_name: string;
  email: string;
  living_preferences: LivingPreferences;
};

export type Household = {
  id: string;
  household_name: string;
  join_code: string;
};

export async function getHouseholdRoommates(): Promise<Roommate[]> {
  const res = await api.get("/household/roommates/");
  return res.data;
}

export async function createHousehold(household_name: string): Promise<Household> {
  const res = await api.post("/household/create/", { household_name });
  return res.data;
}

export async function getHouseholdName(): Promise<Household> {
  const res = await api.get("/household/get-name/");
  return res.data;
}