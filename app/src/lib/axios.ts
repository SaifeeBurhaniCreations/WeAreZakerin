import axios from "axios";
import * as SecureStore from 'expo-secure-store';

const API_URL = "https://24db-2402-8100-2704-d224-4c7-9d9a-f7bc-fecf.ngrok-free.app/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptors
api.interceptors.request.use(
  async (config) => {  
    const token = await SecureStore.getItemAsync("metadata");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired or unauthorized!");
    }
    return Promise.reject(error);
  }
);

export default api;

