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
      console.log('🔑 Attempting auto-login after OTP verification');
      const loginResult = await login(credentials.email, credentials.password);
      console.log('📨 Login response:', { ...loginResult, user: loginResult.user ? 'exists' : 'none' });
      
      if (loginResult.success) {
        console.log('✅ Auto-login successful, preparing to redirect');        setVerificationSuccess('Account verified! Logging you in...');
        // Clear the stored credentials
        sessionStorage.removeItem('tempLoginCredentials');
        console.log('🧹 Cleared temporary login credentials');
        console.log('🚀 Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        console.log('❌ Auto-login failed:', loginResult.error);
        throw new Error(loginResult.error || 'Failed to log in');
      }
    } catch (error) {
      setError(error.message || 'Failed to log in. Please try logging in manually.');
      setIsSubmitting(false);
    }
  };

  const validateOTP = (value) => {
    // Assuming OTP is 6 digits
    return /^\d{6}$/.test(value);
  };  const handleSubmit = async (e) => {
    e.preventDefault();    setError('');

    console.log('🔍 Validating OTP:', otp);
    console.log('📋 Current userId:', userId);
    
    if (!userId) {
      console.error('❌ No userId available for OTP verification');
      setError('Missing user ID. Please try registering again.');
      return;
    }

    if (!validateOTP(otp)) {
      console.log('❌ Invalid OTP format');
      setError('Please enter a valid 6-digit code');
      return;
    }    setIsSubmitting(true);

    try {
      console.log('📤 Submitting OTP verification for userId:', userId, 'with OTP:', otp);
      const storedCredentials = sessionStorage.getItem('tempLoginCredentials');
      if (!storedCredentials) {
        console.error('❌ No stored credentials found');
        throw new Error('Login credentials not found. Please try registering again.');
      }

      const credentials = JSON.parse(storedCredentials);      console.log('📤 Submitting OTP verification for userId:', userId);
      const result = await verifyOTP(userId, otp);
      
      if (result.success) {
        console.log('✅ OTP verification successful, proceeding to login');
        // After successful OTP verification, attempt to log in
        await handleLogin(credentials);
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsResending(true);

    try {
      const result = await requestNewOTP(userId);
      if (result.success) {
        setOtp(''); // Clear the OTP input
        setError('A new verification code has been sent to your email.');
      } else {
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
          </p>          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="\d{6}"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="block w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                     border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0
                     transition-all duration-200 text-center tracking-widest text-lg"
            required
          />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600
                     text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}            className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent
                     text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;
