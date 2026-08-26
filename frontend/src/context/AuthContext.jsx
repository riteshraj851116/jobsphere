import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  login as loginSvc,
  register as registerSvc,
  getMe,
} from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * =========================================================
   * NORMALIZE USER
   * =========================================================
   *
   * Backend response different shapes mein aa sakta hai:
   *
   * { user: {...} }
   * { data: { user: {...} } }
   *
   * Isliye ek hi jagah normalize karenge.
   */

  const extractUser = useCallback((response) => {
    return (
      response?.data?.user ||
      response?.user ||
      response?.data ||
      null
    );
  }, []);

  /*
   * =========================================================
   * INITIAL AUTH CHECK
   * =========================================================
   *
   * Browser refresh hone ke baad token localStorage mein
   * rahega. Token hone par current user backend se fetch
   * karenge.
   */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getMe();

        const currentUser = extractUser(response);

        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.warn(
          "Authentication restore failed:",
          error?.response?.data?.message || error?.message
        );

        /*
         * Token invalid/expired hai.
         * Clean logout state.
         */

        localStorage.removeItem("token");

        if (mounted) {
          setUser(null);
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

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await loginSvc(email, password);

        const token =
          response?.data?.token ||
          response?.token;

        if (!token) {
          throw new Error(
            "Login successful but no authentication token was received."
          );
        }

        /*
         * Save token before requesting user profile.
         * api interceptor can now authenticate getMe().
         */

        localStorage.setItem("token", token);

        try {
          const meResponse = await getMe();

          const currentUser = extractUser(meResponse);

          if (!currentUser) {
            throw new Error(
              "Unable to load user profile after login."
            );
          }

          setUser(currentUser);

          return currentUser;
        } catch (profileError) {
          /*
           * Login token mil gaya but profile fetch fail hua.
           * Inconsistent state avoid karne ke liye token remove.
           */

          localStorage.removeItem("token");
          setUser(null);

          throw profileError;
        }
      } catch (error) {
        throw error;
      }
    },
    [extractUser]
  );

  /*
   * =========================================================
   * REGISTER
   * =========================================================
   */

  const register = useCallback(
    async (userData) => {
      try {
        const response = await registerSvc(userData);

        const token =
          response?.data?.token ||
          response?.token;

        /*
         * Some backends registration ke baad token dete hain,
         * kuch sirf user create karte hain.
         */

        if (!token) {
          /*
           * Agar backend token nahi deta,
           * registration successful maana jayega.
           *
           * User ko login karna padega.
           */

          return null;
        }

        localStorage.setItem("token", token);

        try {
          const meResponse = await getMe();

          const currentUser = extractUser(meResponse);

          if (!currentUser) {
            throw new Error(
              "Unable to load user profile after registration."
            );
          }

          setUser(currentUser);

          return currentUser;
        } catch (profileError) {
          localStorage.removeItem("token");
          setUser(null);

          throw profileError;
        }
      } catch (error) {
        throw error;
      }
    },
    [extractUser]
  );

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const logout = useCallback(() => {
    localStorage.removeItem("token");

    /*
     * Agar project future mein refresh token use kare
     * to yahan usko bhi remove kar sakte hain.
     */

    localStorage.removeItem("refreshToken");

    setUser(null);
  }, []);

  /*
   * =========================================================
   * AUTH FLAGS
   * =========================================================
   */

  const isAuthenticated = Boolean(user);

  const role = String(user?.role || "").toLowerCase();

  const isRecruiter =
    role === "recruiter";

  const isCandidate =
    role === "user" ||
    role === "candidate";

  /*
   * =========================================================
   * CONTEXT
   * =========================================================
   */

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