import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/validators';
import { 
  HiExclamationTriangle, 
  HiEye, 
  HiEyeSlash, 
  HiCheckCircle,
  HiXCircle,
  HiSparkles,
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiArrowPath
} from 'react-icons/hi2';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [focusedField, setFocusedField] = useState('');
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name
    if (!formState.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formState.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formState.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formState.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one number and one special character';
    }
    
    // Validate password confirmation
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate terms agreement
    if (!formState.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API request
      setTimeout(() => {
        const userData = {
          id: Math.random().toString(36).substring(2, 15),
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          role: 'user'
        };
        
        const tokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          deviceToken: 'mock-device-token'
        };
        
        register(tokens, userData);
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      setGeneralError('Registration failed. Please try again.');
      setLoading(false);
    }
  };
  
  const passwordStrength = getPasswordStrength(formState.password);

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
    onToggleShow
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 transition-colors duration-200 ${
            errors[name] 
              ? 'text-red-400' 
              : 'text-gray-400 group-focus-within:text-blue-500'
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
          onChange={handleChange}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField('')}
          className={`
            block w-full pl-10 pr-${showToggle ? '12' : '4'} py-3 rounded-xl border-2 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-0
            ${errors[name] 
              ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:bg-blue-50/50 dark:focus:bg-blue-900/10'
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
        {errors[name] && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <HiXCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {errors[name] && (
        <div className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
          <HiExclamationTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{errors[name]}</p>
        </div>
      )}
    </div>
  );
  
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
          {generalError && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <HiExclamationTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{generalError}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                id="firstName"
                name="firstName"
                type="text"
                label="First name"
                value={formState.firstName}
                placeholder="Enter your first name"
                autoComplete="given-name"
                icon={HiUser}
              />
              <InputField
                id="lastName"
                name="lastName"
                type="text"
                label="Last name"
                value={formState.lastName}
                placeholder="Enter your last name"
                autoComplete="family-name"
                icon={HiUser}
              />
            </div>

            {/* Email Field */}
            <InputField
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formState.email}
              placeholder="Enter your email address"
              autoComplete="email"
              icon={HiEnvelope}
            />

            {/* Password Field */}
            <div className="space-y-2">
              <InputField
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formState.password}
                placeholder="Create a strong password"
                autoComplete="new-password"
                icon={HiLockClosed}
                showToggle={true}
                showField={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
              />
              
              {/* Password Strength Indicator */}
              {formState.password && !errors.password && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${
                          passwordStrength.score === 0 ? 'bg-red-500 w-1/4' :
                          passwordStrength.score === 1 ? 'bg-orange-500 w-1/2' :
                          passwordStrength.score === 2 ? 'bg-yellow-500 w-3/4' :
                          passwordStrength.score >= 3 ? 'bg-green-500 w-full' : ''
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score === 0 ? 'text-red-600' :
                      passwordStrength.score === 1 ? 'text-orange-600' :
                      passwordStrength.score === 2 ? 'text-yellow-600' :
                      passwordStrength.score >= 3 ? 'text-green-600' : ''
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              value={formState.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
              icon={HiLockClosed}
              showToggle={true}
              showField={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-6">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formState.agreeTerms}
                    onChange={handleChange}
                    className={`
                      h-5 w-5 rounded-lg border-2 text-blue-600 focus:ring-blue-500 focus:ring-offset-0
                      transition-all duration-200 cursor-pointer
                      ${errors.agreeTerms 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }
                    `}
                  />
                </div>
                <label htmlFor="agreeTerms" className="text-sm text-gray-700 dark:text-gray-300 leading-6">
                  I agree to the{' '}
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeTerms && (
                <div className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
                  <HiExclamationTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.agreeTerms}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center items-center space-x-2 py-3 px-4 
                rounded-xl text-sm font-semibold text-white shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-200 transform
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {loading ? (
                <>
                  <HiArrowPath className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Create account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our terms and acknowledge our privacy practices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;