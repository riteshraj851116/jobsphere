import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const RecruiterRoute = () => {
  const { user, loading, isRecruiter } = useAuth();

  if (loading) return <Loader fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isRecruiter) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default RecruiterRoute;
