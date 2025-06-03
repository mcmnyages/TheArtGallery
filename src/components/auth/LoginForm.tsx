import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail } from '../../utils/validators';
import { authService } from '../../services/authService';
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
  HiCheckCircle
} from 'react-icons/hi2';

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;  // Make id required
    firstName?: string;
    role?: string;
    email: string;  // Make email required
    status?: 'active' | 'inactive';
    userResources?: Array<{ name: string; status: string }>;
  };
  requireOTP?: boolean;
  userId: string;  // Make userId required
  token?: string;
  refreshToken?: string;
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
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'verifying' | 'redirecting'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'));
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addMessage } = useMessage();

  const getRedirectPathAndMessage = (resources: Array<{ name: string; status: string }>, firstName?: string) => {
    // Filter successful resources first
    const successfulResources = resources.filter(r => r.status === 'success');
    
    console.log('Successful resources for redirection:', successfulResources);
    
    if (successfulResources.length === 0) {
      return {
        path: '/galleries',
        message: `Welcome${firstName ? ', ' + firstName : ''}! Redirecting to galleries.`
      };
    }    
    
    // Define resource priorities and their corresponding paths
    const resourceConfig = {
      'Admin_dashboard': {
        priority: 3,
        path: '/admin/dashboard',
        suffix: 'admin dashboard'
      },
      'Artwork': {
        priority: 2,
        path: '/artist/dashboard',
        suffix: 'artist dashboard'
      },
      'Consumer_content': {
        priority: 1,
        path: '/galleries',
        suffix: 'galleries'
      }
    };    

    // Find the resource with highest priority
    let highestPriorityResource = successfulResources.reduce((highest, current) => {
      const currentPriority = resourceConfig[current.name]?.priority || 0;
      const highestPriority = resourceConfig[highest?.name]?.priority || 0;
      return currentPriority > highestPriority ? current : highest;
    }, successfulResources[0]);

    console.log('Highest priority resource:', highestPriorityResource);

    // Get the configuration for the highest priority resource
    const config = resourceConfig[highestPriorityResource.name] || resourceConfig['Consumer_content'];

    console.log('Selected redirect config:', config);
    
    return {
      path: config.path,
    };
  };

  const validate = (): boolean => {
    const formErrors: FormErrors = {};
    
    if (!email) {
      formErrors.email = 'Email is required';
      addMessage({ type: 'error', text: 'Email is required', duration: 4000 });
    } else if (!validateEmail(email)) {
      formErrors.email = 'Please enter a valid email address';
      addMessage({ type: 'error', text: 'Please enter a valid email address', duration: 4000 });
    }
    
    if (!password) {
      formErrors.password = 'Password is required';
      addMessage({ type: 'error', text: 'Password is required', duration: 4000 });
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setAuthState('authenticating');
    addMessage({ type: 'info', text: 'Authenticating...', duration: 2000 });
    
    try {
      console.log('🚀 Starting login process...');
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      console.log('📤 Sending login request...');
      const result = await login(email, password);
      console.log('📥 Full login result:', JSON.stringify(result, null, 2));

      // Extract userId based on whether it's a success or error response
      const userId = !result.success ? result.userId : result.user.id;
      console.log('🆔 Extracted User ID:', userId);

      if (!userId) {
        console.error('❌ No userId found in response');
        addMessage({
          type: 'error',
          text: 'Server error: User ID not provided',
          duration: 4000
        });
        setAuthState('idle');
        return;
      }

      // First handle verification requirement
      if (result.error?.includes('verification required') || result.error?.includes('Email verification required')) {
        console.log('📝 OTP verification required - Email not yet verified');
        try {
          // Store credentials and user info for after verification
          const tempCredentials = {
            email,
            password,
            userId // Store the actual userId
          };
          
          console.log('💾 Storing temporary credentials:', { email, userId });
          sessionStorage.setItem('tempLoginCredentials', JSON.stringify(tempCredentials));
          
          setAuthState('redirecting');
          addMessage({
            type: 'info',
            text: 'Please verify your email address to continue.',
            duration: 4000
          });

          console.log('🚦 Redirecting to OTP verification:', { userId, email });
          navigate('/otp-verification', { 
            state: { 
              userId: userId,
              email: email,
              isLoginFlow: true 
            },
            replace: true
          });
          return;
        } catch (err) {
          console.error('❌ Error during OTP redirection:', err);
          throw err;
        }
      }

      // If we get here, then verification is not required, so we should have user info
      if (result.success && result.token) {
        // Log the successful login data
        console.log('✅ Login successful - Email already verified');
        console.log('🔑 Token received:', result.token);
        console.log('👤 User info:', {
          userId: result.user?.id || result.userId,
          email: result.user?.email || email,
          status: result.user?.status
        });

        // Store the user info
        const userInfo = {
          userId: result.user?.id || result.userId,
          email: result.user?.email || email,
          status: result.user?.status || 'inactive'
        };
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else if (!result.error?.includes('verification required')) {
        // Handle other error cases (invalid credentials, server error, etc.)
        console.log('❌ Login failed:', result.error);
        addMessage({
          type: 'error',
          text: result.error || 'Invalid email or password',
          duration: 5000
        });
        setAuthState('idle');
        return;
      }

      // Continue with the rest of the login flow for verified users
      console.log('✅ Login successful, proceeding with normal flow');
      try {
        setAuthState('verifying');
        const resources = result.user.userResources || [];
        const { path: redirectPath, message: welcomeMessage } = getRedirectPathAndMessage(
          resources,
          result.user.firstName
        );
        
        addMessage({
          type: 'success',
          text: welcomeMessage,
          icon: HiCheckCircle,
          duration: 3000
        });
        setAuthState('redirecting');
        navigate(redirectPath);

      } catch (error) {
        console.error('Access verification error:', error);
        addMessage({
          type: 'error',
          text: 'Failed to verify access permissions. Please try again.',
          duration: 5000
        });
        await authService.logout();
        setAuthState('idle');
      }

    } catch (error) {
      console.error('Login error:', error);
      addMessage({
        type: 'error',
        text: error.message || 'An unexpected error occurred',
        duration: 5000
      });
      setAuthState('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
      // Update remember me state if email matches saved one
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail === value) {
        setRememberMe(true);
      }
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

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    if (checked && email) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  };

  // Update the submit button to show different loading states
  const getSubmitButtonText = () => {
    switch(authState) {
      case 'authenticating':
        return 'Authenticating...';
      case 'verifying':
        return 'Verifying access...';
      case 'redirecting':
        return 'Redirecting...';
      default:
        return 'Sign in';
    }
  };

  const getSubmitButtonIcon = () => {
    if (authState !== 'idle') {
      return <HiArrowPath className="h-5 w-5 animate-spin" />;
    }
    return <HiArrowRightOnRectangle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />;
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

        {/* Form Container */}        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit}
            method="post"
            action="/login" // Add action to help password managers identify the form
            name="loginform" // Add name to help password managers
            id="loginform"
            autoComplete="on"
          >
            {/* Primary username/email field for password managers */}
            <input
              type="text"
              style={{ display: 'none' }}
              name="username"
              id="username"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <InputField
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={email}
                placeholder="Enter your email address"
                autoComplete="username email" // Support both username and email
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
                id="current-password" // Changed ID to be more specific
                name="current-password" // Changed name to match autocomplete
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
            </div>

            {/* Remember Me and Forgot Password Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>

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
                ${authState !== 'idle'
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {getSubmitButtonIcon()}
              <span>{getSubmitButtonText()}</span>
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