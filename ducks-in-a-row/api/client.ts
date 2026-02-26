import axios from "axios";

// Axios base config
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});