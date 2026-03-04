import { api } from "./client";

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
export async function me(token: string) {
  const res = await api.get("/auth/me/", {
    headers: { Authorization: `Token ${token}` },
  });
  return res.data;
}