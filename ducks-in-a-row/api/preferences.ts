import { api } from "./client";
import type { LivingPreferences } from "./auth";

// Fetch living preferences
export async function getLivingPreferences(): Promise<LivingPreferences> {
  const res = await api.get<LivingPreferences>("/preferences/living/");
  return res.data;
}

// Allow user to edit living preferences
export async function updateLivingPreferences(
  data: Partial<LivingPreferences>
): Promise<LivingPreferences> {
  const res = await api.patch<LivingPreferences>("/preferences/living/", data);
  return res.data;
}