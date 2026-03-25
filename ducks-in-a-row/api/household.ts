import { api } from "./client";
import type { LivingPreferences } from "./auth";

export type Roommate = {
  id: string;
  full_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  display_color?: string | null;
  living_preferences: LivingPreferences | null;
};

export type Household = {
  id: string;
  household_name: string;
  join_code: string;
};

export async function getHouseholdRoommates(): Promise<Roommate[]> {
  const res = await api.get<Roommate[]>("/household/roommates/");
  return res.data;
}

export async function createHousehold(
  household_name: string
): Promise<Household> {
  const res = await api.post<Household>("/household/create/", {
    household_name,
  });
  return res.data;
}

export async function getHouseholdName(): Promise<Household> {
  const res = await api.get<Household>("/household/get-name/");
  return res.data;
}