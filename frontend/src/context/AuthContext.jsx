import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  login as loginService,
  register as registerService,
  getMe,
} from "../services/authService";

export const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    _id: user._id || user.id || "",
    id: user.id || user._id || "",
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractUser = useCallback((response) => {
    const userData =
      response?.data?.user ||
      response?.user ||
      null;

    return normalizeUser(userData);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setUserState(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getMe();
        const currentUser = extractUser(response);

        if (!currentUser) {
          throw new Error("User not found");
        }

        if (mounted) {
          setUserState(currentUser);

          localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
          );
        }
      } catch (error) {
        console.error(
          "Authentication restore failed:",
          error?.response?.data?.message ||
            error?.message
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (mounted) {
          setUserState(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [extractUser]);

  const login = useCallback(
    async (email, password) => {
      const response = await loginService(
        email,
        password
      );

      const token =
        response?.data?.token ||
        response?.token;

      const loggedInUser =
        extractUser(response);

      if (!token) {
        throw new Error(
          "Authentication token was not received"
        );
      }

      if (!loggedInUser) {
        throw new Error(
          "User information was not received"
        );
      }

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setUserState(loggedInUser);

      return loggedInUser;
    },
    [extractUser]
  );

  const register = useCallback(
    async (userData) => {
      const response =
        await registerService(userData);

      const token =
        response?.data?.token ||
        response?.token;

      const registeredUser =
        extractUser(response);

      if (!registeredUser) {
        throw new Error(
          "User information was not received"
        );
      }

      if (token) {
        localStorage.setItem(
          "token",
          token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(registeredUser)
        );

        setUserState(registeredUser);
      }

      return registeredUser;
    },
    [extractUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("local_demo_user");

    setUserState(null);
  }, []);

  const setUser = useCallback((userData) => {
    const normalizedUser =
      normalizeUser(userData);

    setUserState(normalizedUser);

    if (normalizedUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(normalizedUser)
      );
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const isAuthenticated =
    Boolean(user?._id);

  const role =
    String(user?.role || "").toLowerCase();

  const isRecruiter =
    role === "recruiter";

  const isCandidate =
    role === "user" ||
    role === "candidate";

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    isRecruiter,
    isCandidate,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};