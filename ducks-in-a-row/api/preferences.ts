import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./client";

// Fetch living preferences data 
export async function getLivingPreferences() {
  const res = await api.get("/preferences/living/");
  return res.data;
}

// Allow user to edit living preferences
export async function updateLivingPreferences(data: any) {
  console.log("TOKEN:", await AsyncStorage.getItem("accessToken"));
  const res = await api.patch("/preferences/living/", data);
  return res.data;
}