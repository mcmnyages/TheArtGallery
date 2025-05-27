import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { validateEmail } from '../../utils/validators';

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

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
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

  return (
    <div className={`py-8 px-6 shadow rounded-lg sm:px-10 w-full max-w-md ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h2 className={`mb-6 text-2xl font-bold text-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>Sign in to Kabbala</h2>
      
      {loginError && (
        <div className={`mb-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} p-4 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{loginError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500' 
                  : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.email ? 'border-red-300' : ''}`}
              required
            />
            {errors.email && (
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500' 
                  : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.password ? 'border-red-300' : ''}`}
              required
            />
            {errors.password && (
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.password}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link to="/register" className={`font-medium ${
              isDarkMode 
                ? 'text-purple-400 hover:text-purple-300' 
                : 'text-blue-600 hover:text-blue-500'
            }`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;