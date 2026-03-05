import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Axios base config
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach token to every request by user, every api call gets authenticated 
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Token ${token}`; 
  }
  return config;
});