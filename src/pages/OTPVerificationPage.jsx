import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OTPVerification from '../components/auth/OTPVerification';
import { useAuth } from '../hooks/useAuth';

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, email, isLoginFlow } = location.state || {};
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      const resources = user.userResources || [];
      const artistAccess = resources.some(r => r.name === 'Artwork' && r.status === 'success');
      const adminAccess = resources.some(r => r.name === 'Admin_dashboard' && r.status === 'success');
      
      let redirectPath = '/galleries';
      if (adminAccess) redirectPath = '/admin/dashboard';
      else if (artistAccess) redirectPath = '/artist/dashboard';
      
      // Remove any stored credentials
      sessionStorage.removeItem('tempLoginCredentials');
      
      // Redirect to appropriate dashboard
      navigate(redirectPath, { replace: true });
      return;
    }

    // If no userId or email in state, and not authenticated, redirect to login
    if (!userId || !email) {
      sessionStorage.removeItem('tempLoginCredentials');
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, user, userId, email, navigate]);

  const handleBack = () => {
    if (isLoginFlow) {
      sessionStorage.removeItem('tempLoginCredentials');
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  // If the effect is handling the redirect, show a loading state
  if (isAuthenticated || !userId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLoginFlow 
              ? "Your account requires email verification to continue"
              : "Please verify your email to complete registration"
            }
          </p>
        </div>
        
        <OTPVerification
          userId={userId}
          email={email}
          onBack={handleBack}
          isSignupFlow={!isLoginFlow}
        />
      </div>
    </div>
  );
};

export default OTPVerificationPage;