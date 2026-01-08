import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://buseye-backend.onrender.com/api"
    : "http://localhost:5000/api",
});

console.log("🌐 API Base URL:", import.meta.env.PROD ? "PRODUCTION (Render)" : "DEVELOPMENT (localhost:5000)");

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
