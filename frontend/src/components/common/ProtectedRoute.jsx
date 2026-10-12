import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective authorized home
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'ROLE_AGENT') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
};
