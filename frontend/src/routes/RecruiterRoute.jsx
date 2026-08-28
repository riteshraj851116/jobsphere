import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const RecruiterRoute = () => {
  const {
    isAuthenticated,
    isRecruiter,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <Loader fullscreen />;
  }

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

  if (!isRecruiter) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RecruiterRoute;