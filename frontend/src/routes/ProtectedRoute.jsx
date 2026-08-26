import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
   * Auth state abhi load ho rahi hai.
   * Is time redirect nahi karna hai.
   */
  if (loading) {
    return <Loader fullscreen />;
  }

  /*
   * User login nahi hai.
   *
   * Current location save kar rahe hain,
   * taaki login ke baad user original page par
   * wapas ja sake.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  /*
   * User authenticated hai.
   * Child route render hoga.
   */
  return <Outlet />;
};

export default ProtectedRoute;