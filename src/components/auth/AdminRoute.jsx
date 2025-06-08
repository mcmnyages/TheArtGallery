import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  const hasAdminAccess = user.userResources?.some(r => 
    r.name === 'Admin_dashboard' && r.status === 'success'
  );

  if (!hasAdminAccess) {
    return <Navigate to="/galleries" />;
  }

  return children;
};

export default AdminRoute;
