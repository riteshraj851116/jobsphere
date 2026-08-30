import api from "./api";
import { DEMO_CANDIDATE, DEMO_RECRUITER } from "../utils/mockData";

export const login = async (email, password) => {
  const cleanEmail = String(email || "").trim().toLowerCase();

  // Instant Demo Accounts
  if (cleanEmail === "ritesh.raj@example.com" || cleanEmail === "candidate@jobsphere.io" || cleanEmail === "demo") {
    const demoData = {
      token: "demo_candidate_token_" + Date.now(),
      user: DEMO_CANDIDATE
    };
    localStorage.setItem("token", demoData.token);
    localStorage.setItem("user", JSON.stringify(demoData.user));
    return { success: true, data: demoData, user: demoData.user, token: demoData.token };
  }

  if (cleanEmail === "recruiter@jobsphere.io" || cleanEmail === "recruiter") {
    const demoData = {
      token: "demo_recruiter_token_" + Date.now(),
      user: DEMO_RECRUITER
    };
    localStorage.setItem("token", demoData.token);
    localStorage.setItem("user", JSON.stringify(demoData.user));
    return { success: true, data: demoData, user: demoData.user, token: demoData.token };
  }

  try {
    const response = await api.post("/auth/login", {
      email: cleanEmail,
      password,
    });
    return response.data;
  } catch (error) {
    // If backend is offline on GitHub Pages live preview, simulate login
    if (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      const fallbackUser = {
        _id: "user-" + Date.now(),
        id: "user-" + Date.now(),
        name: cleanEmail.split("@")[0] || "Candidate",
        email: cleanEmail,
        role: "user",
        skills: ["React", "Node.js", "JavaScript"],
      };
      const demoData = {
        token: "offline_token_" + Date.now(),
        user: fallbackUser
      };
      localStorage.setItem("token", demoData.token);
      localStorage.setItem("user", JSON.stringify(fallbackUser));
      return { success: true, data: demoData, user: fallbackUser, token: demoData.token };
    }
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", {
      name: userData.name?.trim(),
      username: userData.username?.trim(),
      email: userData.email?.trim(),
      password: userData.password,
      role: userData.role || "user",
    });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      const newUser = {
        _id: "user-" + Date.now(),
        id: "user-" + Date.now(),
        name: userData.name?.trim() || "Candidate",
        username: userData.username?.trim() || "user",
        email: userData.email?.trim(),
        role: userData.role || "user",
        skills: ["React", "Node.js", "JavaScript"],
      };
      const demoData = {
        token: "offline_token_" + Date.now(),
        user: newUser
      };
      localStorage.setItem("token", demoData.token);
      localStorage.setItem("user", JSON.stringify(newUser));
      return { success: true, data: demoData, user: newUser, token: demoData.token };
    }
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return { success: true, data: { user: parsed }, user: parsed };
    }
    throw error;
  }
};

const authService = {
  login,
  register,
  getMe,
};

export default authService;