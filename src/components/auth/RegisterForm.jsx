import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail } from '../../utils/validators';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  HiExclamationTriangle, 
  HiEye, 
  HiEyeSlash, 
  HiXCircle,
  HiSparkles,
  HiEnvelope,
  HiLockClosed,
  HiArrowPath,
  HiArrowRightOnRectangle,
  HiCheckCircle,
  HiUser
} from 'react-icons/hi2';
import OTPVerification from './OTPVerification'; // Adjust the import based on your file structure

const InputField = ({ 
  id, 
  name, 
  type, 
  label, 
  value, 
  placeholder, 
  autoComplete, 
  icon: Icon, 
  showToggle = false,
  showField = true,
  onToggleShow,
  onChange,
  error,
  focusedField,
  onFocus,
  onBlur
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 transition-colors duration-200 ${
          focusedField === name 
            ? 'text-blue-500' 
            : error 
              ? 'text-red-400' 
              : 'text-gray-400'
        }`} />
      </div>
      <input
        id={id}
        name={name}
        type={showToggle ? (showField ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus(name)}
        onBlur={onBlur}
        className={`
          block w-full pl-10 pr-${showToggle ? '12' : '4'} py-3 rounded-xl border-2 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-0
          ${error 
            ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
            : focusedField === name
              ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
        `}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onToggleShow}
        >
          {showField ? (
            <HiEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
          ) : (
            <HiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
          )}
        </button>
      )}
      {error && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <HiXCircle className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
    {error && (
      <div className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
        <HiExclamationTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )}
  </div>
);

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { isDarkMode } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = `${field === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 2) {
          error = `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else {
          const passwordErrors = validatePassword(value);
          if (passwordErrors.length > 0) {
            error = passwordErrors.join('. ');
          }
        }
        // Check if confirmPassword needs to be validated
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }));
        } else {
          setErrors(prev => {
            const { confirmPassword, ...rest } = prev;
            return rest;
          });
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error; // Return true if valid, false if there's an error
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    
    console.log('🔍 Starting registration form validation');
    // Validate all fields
    const isFirstNameValid = validateField('firstName', formData.firstName);
    const isLastNameValid = validateField('lastName', formData.lastName);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

    // Return if any validation fails
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
        !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationError('');
    
    try {
      const { confirmPassword, ...userData } = formData;      console.log('📤 Submitting registration data:', { ...userData, password: '***' });
      const result = await register(userData);
        if (result.success) {
        console.log('📝 Registration successful, storing credentials and showing OTP verification');
        console.log('🆔 User ID for OTP verification:', result.userId);
        sessionStorage.setItem('tempLoginCredentials', JSON.stringify({
          email: userData.email,
          password: userData.password
        }));
        setRegisteredEmail(userData.email);
        setRegisteredUserId(result.userId);
        setIsSubmitting(false); // Set this to false before showing OTP to prevent button staying in loading state
        setShowOTPVerification(true);
      } else {
        const errorMessage = result.error || 'Registration failed. Please try again.';
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({
            ...prev,
            email: errorMessage
          }));
        }
        setRegistrationError(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsSubmitting(true);
        setRegistrationError('');
        
        // Fetch user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Call our auth service with the Google response
        const result = await register({
          token: tokenResponse.access_token,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          imageUrl: userInfo.picture
        }, 'google');

        if (result.success) {
          setRegistrationSuccess('Registration successful!');
          if (result.requireOTP) {
            setRegisteredUserId(result.userId);
            setRegisteredEmail(userInfo.email);
            setShowOTPVerification(true);
          } else {
            navigate('/');
          }
        } else {
          setRegistrationError(result.error || 'Failed to register with Google');
        }
      } catch (error) {
        console.error('Google registration error:', error);
        setRegistrationError('Failed to register with Google. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setRegistrationError('Google sign-in was cancelled or failed. Please try again.');
    },
    flow: 'implicit',
    popup: true,
    ux_mode: 'popup',
  });

  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <HiSparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Verify Your Account
            </h2>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <OTPVerification
              userId={registeredUserId}
              email={registeredEmail}
              onBack={() => setShowOTPVerification(false)}
              isSignupFlow={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <HiSparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          {/* Error Alert */}
          {registrationError && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <HiExclamationTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{registrationError}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {registrationSuccess && (
            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 mb-6 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <HiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{registrationSuccess}</p>
              </div>
            </div>
          )}
          
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit}
            method="post"
            name="registerform"
            id="registerform"
            autoComplete="on"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                id="firstName"
                name="firstName"
                type="text"
                label="First name"
                value={formData.firstName}
                placeholder="Enter your first name"
                autoComplete="given-name"
                icon={HiUser}
                onChange={(value) => handleInputChange('firstName', value)}
                error={errors.firstName}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
              />

              <InputField
                id="lastName"
                name="lastName"
                type="text"
                label="Last name"
                value={formData.lastName}
                placeholder="Enter your last name"
                autoComplete="family-name"
                icon={HiUser}
                onChange={(value) => handleInputChange('lastName', value)}
                error={errors.lastName}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <div>
              <InputField
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={formData.email}
                placeholder="Enter your email address"
                autoComplete="email"
                icon={HiEnvelope}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <div>
              <InputField
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                placeholder="Choose a strong password"
                autoComplete="new-password"
                icon={HiLockClosed}
                showToggle={true}
                showField={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                onChange={(value) => handleInputChange('password', value)}
                error={errors.password}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <div>
              <InputField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                value={formData.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
                icon={HiLockClosed}
                showToggle={true}
                showField={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                error={errors.confirmPassword}
                focusedField={focusedField}
                onFocus={setFocusedField}
                onBlur={() => setFocusedField('')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                group w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl 
                text-white font-medium shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-200 transform
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <HiArrowPath className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <HiArrowRightOnRectangle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Create account</span>
                </>
              )}
            </button>
          </form>      {/* Google Sign-In Button */}
      <div className="mt-6">
        <button
          onClick={() => googleLogin()}
          disabled={isSubmitting}
          className={`
            w-full px-4 py-2 border flex gap-2 items-center justify-center
            rounded-lg text-gray-700 dark:text-gray-300 
            bg-white dark:bg-gray-800 
            hover:bg-gray-50 dark:hover:bg-gray-700
            border-gray-200 dark:border-gray-600
            hover:border-gray-300 dark:hover:border-gray-500
            transition-colors duration-200
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="font-medium">
            {isSubmitting ? 'Signing in...' : 'Continue with Google'}
          </span>
        </button>
      </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secure registration powered by modern encryption technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;