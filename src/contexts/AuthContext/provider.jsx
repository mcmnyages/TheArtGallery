import React, { useState, useEffect } from 'react';
import * as tokenService from '../../services/tokenService';
import { authService } from '../../services/authService';
import { AuthContext } from './context';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await authService.login(email, password);
      
      if (response.success && response.user && response.token) {
        // Set tokens first
        tokenService.setTokens({
          accessToken: response.token,
          refreshToken: response.refreshToken
        });

        const userWithResources = {
          ...response.user,
          userResources: response.user.userResources || []
        };

        // Store user with resources
        localStorage.setItem('user', JSON.stringify(userWithResources));
        setUser(userWithResources);
        setIsAuthenticated(true);

        console.log('Login successful, user resources:', userWithResources.userResources);
        return { success: true, user: userWithResources };
      }
      
      return { 
        success: false, 
        error: response.error || 'Login failed' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
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
      
      if (response.success && response.user) {
        // If registration is successful, automatically log the user in
        const loginResponse = await handleLogin(userData.email, userData.password);
        if (loginResponse.success) {
          return { success: true, user: loginResponse.user };
        }
      }
      
      return { 
        success: false, 
        error: response.error || 'Registration failed' 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const handleUpdateUser = (userData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const handleVerifyOTP = async (email, otp) => {
    try {
      const response = await authService.verifyOTP(email, otp);
      
      if (response.success && response.user && response.token) {
        // Set tokens first
        tokenService.setTokens({
          accessToken: response.token,
          refreshToken: response.refreshToken
        });

        const userWithResources = {
          ...response.user,
          userResources: response.user.userResources || []
        };

        // Store user with resources
        localStorage.setItem('user', JSON.stringify(userWithResources));
        setUser(userWithResources);
        setIsAuthenticated(true);

        return { success: true, user: userWithResources };
      }
      
      return { 
        success: false, 
        error: response.error || 'OTP verification failed' 
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
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
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log('No cached user found, logging out');
            handleLogout();
          }
        } catch (error) {
          console.error('Failed to verify access:', error);
          handleLogout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
    verifyOTP: handleVerifyOTP
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
