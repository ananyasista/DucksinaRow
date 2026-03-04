import { api } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sign up
export async function signup(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  join_code?: string;
}) {
  const res = await api.post("/auth/signup/", data);
  return res.data; // { token, user }
}

// Login 
export async function login(data: { email: string; password: string }) {
  const res = await api.post("/auth/login/", data);
  return res.data; // { token, user }
}

// User's profile
export type ProfileResponse = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  household_join_code?: string | null;
  living_preferences?: LivingPreferences | null;
};

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

export async function me(): Promise<ProfileResponse> {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) throw new Error("No access token found.");

  const res = await api.get("/auth/profile/", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return res.data;
}

export async function updateProfile(patch: {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}) {
  const res = await api.patch("/auth/profile/update/", patch);
  return res.data;
}

export async function changePassword(data: { old_password: string; new_password: string }) {
  const res = await api.post("/auth/change-password/", data);
  return res.data;
}