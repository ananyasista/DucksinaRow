import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./client";

export async function getLivingPreferences() {
  const res = await api.get("/preferences/living/");
  return res.data;
}

export async function updateLivingPreferences(data: any) {
  console.log("TOKEN:", await AsyncStorage.getItem("accessToken"));
  const res = await api.patch("/preferences/living/", data);
  return res.data;
}