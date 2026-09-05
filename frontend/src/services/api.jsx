import axios from "axios";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // In production / deployed domain (e.g. Vercel, custom domain)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      // If an external production URL is explicitly provided (and not localhost), use it
      if (envUrl && /^https:\/\//i.test(envUrl) && !envUrl.includes("localhost")) {
        return envUrl;
      }
      // Otherwise use the same-origin serverless API endpoint
      return "/api";
    }
  }

  // Localhost development
  return envUrl || "http://localhost:5005/api";
};

const API_BASE_URL = getApiBaseUrl();

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
      if (Array.isArray(response.data.data)) {
        // Keep array structure intact so array methods and mappings work reliably
        return response;
      }
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
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/me");

    // Only clear session and redirect on 401 if this is NOT an auth request
    // and the user does NOT have a valid cached session (demo users are always kept)
    if (status === 401 && !isAuthRequest) {
      const cachedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      // Only redirect if there's truly no cached session
      if (!cachedUser || !token) {
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
    }

    return Promise.reject(error);
  }
);

export default api;