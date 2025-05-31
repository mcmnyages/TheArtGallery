import React, { useState, useEffect } from 'react';
import * as tokenService from '../../services/tokenService';
import { authService } from '../../services/authService';
import { AuthContext } from './context';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = (userData, token, refreshToken) => {
    // Ensure user data has all required fields
    const enrichedUserData = {
      ...userData,
      role: userData.role || 'user',
      permissions: userData.permissions || [],
      membershipTier: userData.membershipTier || 'free'
    };
    
    setUser(enrichedUserData);
    setIsAuthenticated(true);
    tokenService.setTokens({ token, refreshToken });
    
    // Cache user data with role information
    localStorage.setItem('user', JSON.stringify(enrichedUserData));
  };  const handleLogin = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with:', { email });
      const response = await authService.login(email, password);
      console.log('AuthContext: Raw response:', response);

      if (response.success && response.user) {
        console.log('AuthContext: Valid login response:', {
          user: {
            id: response.user.id,
            email: response.user.email,
            firstName: response.user.firstName,
            role: response.user.role
          }
        });
        handleAuthSuccess(response.user, response.token, response.refreshToken);
        return { success: true, user: response.user };
      }
      
      // If we got here, either success is false or we don't have a user
      const errorMessage = response.error || 'Invalid credentials. Please check your email and password.';
      console.log('AuthContext: Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('AuthContext: Login error:', {
        message: error.message,
        stack: error.stack
      });

      let errorMessage = error.message || 'An error occurred during login';
      
      // Make error messages more user-friendly
      if (error.message === 'Invalid password') {
        errorMessage = 'Invalid password. Please check your password and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const handleLogout = () => {
    tokenService.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        handleAuthSuccess(response.user, response.token, response.refreshToken);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const handleUpdateUser = (userData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = tokenService.getTokens();
        
        if (!tokens || !tokens.accessToken) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        try {
          // Try to get cached user data from localStorage
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            const userData = JSON.parse(cachedUser);
            handleAuthSuccess(userData, tokens);          } else {
            // Token exists but no cached user data
            // We should redirect to login
            handleLogout();
            return;
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          handleLogout();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const contextValue = {
    isAuthenticated,
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateUser: handleUpdateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
