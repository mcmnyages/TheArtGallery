import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail } from '../../utils/validators';
import { 
  HiExclamationTriangle, 
  HiEye, 
  HiEyeSlash, 
  HiXCircle,
  HiSparkles,
  HiEnvelope,
  HiLockClosed,
  HiArrowPath,
  HiArrowRightOnRectangle
} from 'react-icons/hi2';

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    firstName?: string;
    role?: string;
    email?: string;
  };
  error?: string;
}

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  icon: React.ElementType;
  showToggle?: boolean;
  showField?: boolean;
  onToggleShow?: () => void;
  onChange: (value: string) => void;
  error?: string;
  focusedField: string;
  onFocus: (field: string) => void;
  onBlur: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
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

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const formErrors: FormErrors = {};
    
    if (!email) {
      formErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      formErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      formErrors.password = 'Password is required';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with email:', email);
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      const result = await login(email, password);
      console.log('Login response received:', {
        firstName: result.user?.firstName,
        email: result.user?.email,
      });
        if (result.success && result.user) {
        // Determine role and redirect accordingly
        const role = result.user.role;
        let redirectPath = '/galleries'; // default path for customers

        if (role === 'artist') {
          redirectPath = '/artist/dashboard';
          console.log('Artist login detected, redirecting to dashboard');
        } else {
          console.log('Customer login detected, redirecting to galleries');
        }

        console.log('Navigating to:', redirectPath);
        navigate(redirectPath);
      } else {
        setLoginError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Clear errors for the field being edited
    if (errors[field as keyof FormErrors]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <HiSparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          {/* Error Alert */}
          {loginError && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <HiExclamationTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{loginError}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <InputField
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={email}
              placeholder="Enter your email address"
              autoComplete="email"
              icon={HiEnvelope}
              onChange={(value) => handleInputChange('email', value)}
              error={errors.email}
              focusedField={focusedField}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField('')}
            />

            {/* Password Field */}
            <InputField
              id="password"
              name="password"
              type="password"
              label="Password"
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
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

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                group relative w-full flex justify-center items-center space-x-2 py-3 px-4 
                rounded-xl text-sm font-semibold text-white shadow-lg
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <HiArrowRightOnRectangle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secure login powered by modern encryption technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;