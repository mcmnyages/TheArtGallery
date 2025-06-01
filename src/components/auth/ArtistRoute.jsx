import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ArtistRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    console.log('Route status: Loading dashboard...');
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated || !user) {
    console.log('Route status: Not authenticated, redirecting to login dashboard');
    return <Navigate to="/login" />;
  }

  const hasArtworkAccess = user.userResources?.some(r => 
    r.name === 'Artwork' && r.status === 'success'
  );

  console.log('Artist route check:', {
    userResources: user.userResources,
    hasAccess: hasArtworkAccess,
    currentUser: user.email || user.username,
    redirectingTo: hasArtworkAccess ? '/artist/dashboard' : '/galleries'
  });

  if (!hasArtworkAccess) {
    console.log('Route status: No Artwork access, redirecting to galleries dashboard');
    return <Navigate to="/galleries" />;
  }

  console.log('Route status: Access granted, entering artist dashboard for user:', user.email || user.username);
  return children;
};

export default ArtistRoute;
