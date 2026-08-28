import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email: email.trim(),
    password,
  });

  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", {
    name: userData.name?.trim(),
    username: userData.username?.trim(),
    email: userData.email?.trim(),
    password: userData.password,
    role: userData.role || "user",
  });

  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

const authService = {
  login,
  register,
  getMe,
};

export default authService;