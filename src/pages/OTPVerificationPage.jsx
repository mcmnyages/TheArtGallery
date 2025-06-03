import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OTPVerification from '../components/auth/OTPVerification';

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, email, isLoginFlow } = location.state || {};

  const handleBack = () => {
    if (isLoginFlow) {
      sessionStorage.removeItem('tempLoginCredentials');
      navigate('/login');
    } else {
      navigate('/register');
    }
};

if (!userId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Invalid Access
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please initiate the process from the login or registration page.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
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
        />
      </div>
    </div>  );
};

export default OTPVerificationPage;