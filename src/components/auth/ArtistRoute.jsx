import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ArtistRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has artist role
  if (!user?.role || user.role !== 'artist') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ArtistRoute;
