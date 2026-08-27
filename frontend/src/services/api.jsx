import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || "");
    const isAuthRequest =
      url.includes("/auth/login") || url.includes("/auth/register");

    // Handle 401 Unauthorized
    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/jobsphere/login';
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error("Access forbidden:", error.response?.data?.message || "You don't have permission to access this resource");
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.error("Resource not found:", error.response?.data?.message || "The requested resource was not found");
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error("Server error:", error.response?.data?.message || "Internal server error");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message || "Unable to connect to the server");
    }

    return Promise.reject(error);
  }
);

export default api;
