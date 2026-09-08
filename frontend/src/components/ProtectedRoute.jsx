import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Loader from "./common/Loader.jsx";

const ProtectedRoute = () => {
  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <Loader fullscreen text="Loading JobSphere..." />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;