import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { HiExclamationTriangle, HiCheckCircle, HiClock } from 'react-icons/hi2';

const OTPVerification = ({ userId, email, onBack, isSignupFlow }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'redirecting'
  const [cooldownTime, setCooldownTime] = useState(isSignupFlow ? 300 : 0);
  const { verifyOTP, requestNewOTP, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Cleanup effect to prevent OTP verification if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Clean up stored credentials
      sessionStorage.removeItem('tempLoginCredentials');
      // Redirect to user's appropriate dashboard will be handled by OTPVerificationPage
    }
  }, [isAuthenticated]);

  // Timer effect for cooldown
  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(time => time - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  // Check for stored credentials and redirect if not found
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem('tempLoginCredentials');
    if (!storedCredentials && !isAuthenticated) {
      setError('Login credentials not found. Please try registering again.');
      // Allow time for error to be shown before redirecting
      const timeout = setTimeout(() => {
        if (onBack) onBack();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, onBack]);

  // Format remaining time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const handleLogin = async (credentials) => {
    try {
      setVerificationStatus('redirecting');
      console.log('🔑 Attempting auto-login after OTP verification', { email: credentials.email });
      const loginResult = await login(credentials.email, credentials.password);
      console.log('📥 Login response:', { 
        success: loginResult.success, 
        hasUser: !!loginResult.user,
        resources: loginResult.user?.userResources 
      });
      
      if (loginResult.success) {
        console.log('✅ Login successful after OTP verification');
        // Clean up credentials immediately
        sessionStorage.removeItem('tempLoginCredentials');
        
        // Determine redirect path immediately
        const defaultPath = '/galleries';
        const resources = loginResult.user?.userResources || [];
        const artistAccess = resources.some(r => r.name === 'Artwork' && r.status === 'success');
        const adminAccess = resources.some(r => r.name === 'Admin_dashboard' && r.status === 'success');
        
        let redirectPath = defaultPath;
        if (adminAccess) redirectPath = '/admin/dashboard';
        else if (artistAccess) redirectPath = '/artist/dashboard';

        // Set brief success message and redirect immediately
        const actionText = isSignupFlow ? 'Registration completed!' : 'Login successful!';
        setVerificationSuccess(actionText);
        
        // Immediate redirect with replace to prevent back navigation
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(loginResult.error || 'Failed to log in');
      }
    } catch (error) {
      setVerificationStatus('idle');
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
    setVerificationStatus('verifying');

    if (!userId) {
      setError('Missing user ID. Please try registering again.');
      setVerificationStatus('idle');
      return;
    }

    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit code');
      setVerificationStatus('idle');
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
        setVerificationStatus('success');
        // Immediately proceed to login without showing intermediate success message
        await handleLogin(JSON.parse(storedCredentials));
      } else {
        console.error('❌ OTP verification failed:', result.error);
        setError(result.error || 'Invalid OTP. Please try again.');
        setVerificationStatus('idle');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setError(error.message || 'An unexpected error occurred');
      setVerificationStatus('idle');
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsResending(true);
    setVerificationSuccess('Sending new verification code...'); // Add immediate feedback
    
    try {
      console.log('📤 Requesting new OTP for user:', userId);
      const result = await requestNewOTP(userId);
      console.log('📥 Resend OTP response:', { success: result.success, error: result.error });
      
      if (result.success) {
        console.log('✅ New OTP sent successfully');
        setOtp('');
        setVerificationSuccess('A new verification code has been sent to your email.');
        setError('');
        setCooldownTime(300);
      } else {
        console.error('❌ Failed to resend OTP:', result.error);
        setError(result.error || 'Failed to resend verification code.');
        setVerificationSuccess('');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend verification code.');
      setVerificationSuccess('');
    } finally {
      setIsResending(false);
    }
  };

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

      {/* Progress Alert */}
      {verificationStatus !== 'idle' && !error && !verificationSuccess && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {verificationStatus === 'verifying' && 'Verifying your code...'}
              {verificationStatus === 'redirecting' && (isSignupFlow ? 'Completing registration...' : 'Logging you in...')}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Container */}
        <div className="space-y-4">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Enter Verification Code
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isSignupFlow 
              ? 'A verification code has been sent to complete your registration.' 
              : 'Please enter the verification code to log in.'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Code sent to: {email}
          </p>
          <div>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setOtp(value);
                if (value.length === 6) {
                  setError('');
                }
              }}
              className={`block w-full appearance-none rounded-lg border px-3 py-2 shadow-sm sm:text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}
                dark:bg-gray-800 dark:text-white`}
              placeholder="Enter 6-digit code"
            />
          </div>
          
          {/* Code Expiration Notice */}
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            <HiClock className="inline-block w-4 h-4 mr-1 -mt-1" />
            This code will expire in 30 minutes
          </p>

          {/* Resend Button Container */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={cooldownTime > 0 || isResending}
              className={`text-sm font-medium 
                ${cooldownTime > 0 || isResending
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300'
                }`}
            >
              {isResending ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Sending code...
                </>
              ) : cooldownTime > 0 ? (
                `Resend available in ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, '0')}`
              ) : (
                'Resend code'
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isSubmitting || verificationStatus !== 'idle'}
            className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white
              ${isSubmitting || verificationStatus !== 'idle'
                ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {verificationStatus === 'verifying' ? (
              <>
                <span className="inline-block animate-spin mr-2">↻</span>
                Verifying...
              </>
            ) : verificationStatus === 'redirecting' ? (
              <>
                <span className="inline-block animate-spin mr-2">↻</span>
                {isSignupFlow ? 'Completing registration...' : 'Logging in...'}
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting || verificationStatus !== 'idle'}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium 
              text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;
