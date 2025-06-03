import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';

const OTPVerification = ({ userId, email, onBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const { verifyOTP, requestNewOTP, login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (credentials) => {
    try {
      console.log('🔑 Attempting auto-login after OTP verification', { email: credentials.email });
      const loginResult = await login(credentials.email, credentials.password);
      console.log('📥 Login response:', { 
        success: loginResult.success, 
        hasUser: !!loginResult.user,
        resources: loginResult.user?.userResources 
      });
      
      if (loginResult.success) {
        console.log('✅ Login successful after OTP verification');
        setVerificationSuccess('Account verified! Logging you in...');
        sessionStorage.removeItem('tempLoginCredentials');
        
        // Determine where to navigate based on user's role/resources
        const defaultPath = '/galleries';
        const resources = loginResult.user?.userResources || [];
        const artistAccess = resources.some(r => r.name === 'Artwork' && r.status === 'success');
        const adminAccess = resources.some(r => r.name === 'Admin_dashboard' && r.status === 'success');
        
        setTimeout(() => {
          let redirectPath = defaultPath;
          if (adminAccess) redirectPath = '/admin/dashboard';
          else if (artistAccess) redirectPath = '/artist/dashboard';
          navigate(redirectPath);
        }, 1500); // Brief delay to show success message
      } else {
        throw new Error(loginResult.error || 'Failed to log in');
      }
    } catch (error) {
      setError(error.message || 'Failed to log in. Please try logging in manually.');
      setIsSubmitting(false);
    }
  };

  const validateOTP = (value) => {
    return /^\d{6}$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Missing user ID. Please try registering again.');
      return;
    }

    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔍 Checking stored credentials and submitting OTP');
      const storedCredentials = sessionStorage.getItem('tempLoginCredentials');
      if (!storedCredentials) {
        console.error('❌ No stored credentials found in session storage');
        throw new Error('Login credentials not found. Please try registering again.');
      }

      console.log('📤 Submitting OTP verification request', { userId, otpLength: otp.length });
      const result = await verifyOTP(userId, otp);
      console.log('📥 OTP verification response:', { success: result.success, error: result.error });
      
      if (result.success) {
        console.log('✅ OTP verified successfully, proceeding to login');
        setVerificationSuccess('Verification successful! Logging you in...');
        // After successful OTP verification, attempt to log in
        await handleLogin(JSON.parse(storedCredentials));
      } else {
        console.error('❌ OTP verification failed:', result.error);
        setError(result.error || 'Invalid OTP. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setError(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsResending(true);    try {
      console.log('📤 Requesting new OTP for user:', userId);
      const result = await requestNewOTP(userId);
      console.log('📥 Resend OTP response:', { success: result.success, error: result.error });
      
      if (result.success) {
        console.log('✅ New OTP sent successfully');
        setOtp('');
        setError('A new verification code has been sent to your email.');
      } else {
        console.error('❌ Failed to resend OTP:', result.error);
        setError(result.error || 'Failed to resend verification code.');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  // Check for stored credentials on mount
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem('tempLoginCredentials');
    if (!storedCredentials) {
      setError('Login credentials not found. Please try registering again.');
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <HiExclamationTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {verificationSuccess && (
        <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 mb-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <HiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {verificationSuccess}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Verification Code
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Please enter the verification code sent to {email}
          </p>
          <input
            type="text"
            id="otp"
            name="otp"
            maxLength="6"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            placeholder="Enter 6-digit code"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending || isSubmitting}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600
                     text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent
                     text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;
