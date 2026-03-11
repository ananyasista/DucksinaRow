import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Axios base config
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach token to every request by user, every api call gets authenticated 
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  const url = config.url || "";

  const isAuthRoute =
    url.includes("/auth/login/") || url.includes("/auth/signup/");

  if (!isAuthRoute && token) {
    config.headers.Authorization = `Token ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});