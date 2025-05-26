import React, { createContext, useState, useEffect } from 'react';
import * as tokenService from '../services/tokenService';
import { fetchUserProfile } from '../services/api';

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

  // Check for existing authentication on component mount
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
        
        // If token is expired, attempt to refresh
        if (tokenService.isTokenExpired()) {
          try {
            await tokenService.refreshAccessToken();
          } catch (error) {
            // If refresh fails, log the user out
            handleLogout();
            setIsLoading(false);
            return;
          }
        }
        
        // Fetch user profile with valid token
        try {
          const userData = await fetchUserProfile(tokenService.getAccessToken());
          setUser(userData);
          setIsAuthenticated(true);
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

  const handleLogin = (tokens, userData) => {
    tokenService.setTokens(tokens);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    tokenService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleRegister = (tokens, userData) => {
    handleLogin(tokens, userData);
  };

  const handleUpdateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

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