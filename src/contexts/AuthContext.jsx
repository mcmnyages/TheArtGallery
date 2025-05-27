import React, { useState, useEffect, createContext } from 'react';
import * as tokenService from '../services/tokenService';
import { authService } from '../services/authService';
import { mockApi } from '../data/mockData';

// Create context with default values
export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = (userData, token, refreshToken) => {
    // Ensure user data has all required fields
    const enrichedUserData = {
      ...userData,
      role: userData.role || 'customer',
      permissions: userData.permissions || [],
      membershipTier: userData.membershipTier || 'free'
    };
    
    setUser(enrichedUserData);
    setIsAuthenticated(true);
    tokenService.setTokens({ token, refreshToken });
    
    // Cache user data with role information
    localStorage.setItem('user', JSON.stringify(enrichedUserData));
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await mockApi.login(email, password);
      handleAuthSuccess(response.user, response.tokens);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    tokenService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleRegister = async (email, password, firstName, lastName) => {
    try {
      // For now, just use login since we're mocking
      const response = await mockApi.login(email, password);
      handleAuthSuccess(response.user, response.tokens);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleUpdateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
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
            handleAuthSuccess(userData, tokens);
          } else {
            // Fallback to mock login
            const response = await mockApi.login("", "");
            if (response.user) {
              handleAuthSuccess(response.user, tokens);
            }
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