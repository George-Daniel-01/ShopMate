import axios from "axios";
import { API_BASE_URL } from "@/config";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
