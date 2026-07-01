import axios from "axios";

// All our backend routes live under this base URL
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Before every request, attach the saved login token (if we have one)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
