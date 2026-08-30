import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5005/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
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
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Graceful JSend envelope unwrapper that maintains backwards compatibility
    if (response?.data && response.data.success && response.data.data !== undefined) {
      const unwrapped = {
        success: response.data.success,
        ...response.data.data,
      };
      Object.defineProperty(unwrapped, "data", {
        get() {
          return this;
        },
        configurable: true,
        enumerable: false,
      });
      response.data = unwrapped;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || "");

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");

      if (typeof window !== "undefined") {
        const isGitHubPages =
          window.location.pathname.startsWith("/jobsphere/");

        window.location.href = isGitHubPages
          ? "/jobsphere/login"
          : "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;