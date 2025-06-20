import React, { useState, useEffect } from 'react';
import * as tokenService from '../../services/tokenService';
import { authService } from '../../services/authService';
import { treasuryService } from '../../services/treasuryService';
import { AuthContext } from './context';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await authService.login(email, password);
      console.log('Auth service response:', response);
      
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

        // Check if user is an artist
        const isArtist = userWithResources.userResources.some(
          r => r.name === 'Artwork' && r.status === 'success'
        );

        if (isArtist) {
          try {
            // Check if artist has a wallet
            const walletCheck = await treasuryService.checkWallet();
            console.log('Artist wallet check:', walletCheck);
            
            // Store wallet information in user data if it exists
            if (walletCheck.hasWallet && walletCheck.wallet) {
              userWithResources.walletId = walletCheck.wallet._id;
              console.log('Artist wallet ID:', walletCheck.wallet._id);
            }
          } catch (error) {
            console.error('Error checking artist wallet:', error);
            // Continue with login even if wallet check fails
          }
        }

        // Store user with resources and wallet info
        localStorage.setItem('user', JSON.stringify(userWithResources));
        setUser(userWithResources);
        setIsAuthenticated(true);
        
        console.log('Login successful, user resources:', userWithResources.userResources);
        return { success: true, user: userWithResources };
      }
      
      // Make sure we pass through all properties for error cases
      console.log('Login unsuccessful, passing through response:', response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred',
        userId: ''  // Include empty userId for type safety
      };
    }
  };

  const handleLogout = () => {
    tokenService.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };  const handleRegister = async (userData) => {
    try {
      console.log('⌛ Attempting registration with:', { ...userData, password: '***' });
      const response = await authService.register(userData);      console.log('📨 Registration response:', response);
        if (response.success && response.user) {
        const userId = response.user.id;
        console.log('✅ Registration successful, userId:', userId);
        return {
          success: true,
          user: response.user,
          userId: userId,
          message: response.message
        };
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
  };  const handleVerifyOTP = async (userId, otp) => {
    try {
      console.log('⌛ Attempting OTP verification for userId:', userId, 'with OTP:', otp);
      const response = await authService.verifyOTP(userId, otp);      
      console.log('📨 OTP verification response:', response);
      
      if (response.success) {
        console.log('✅ OTP verification successful');
        // Return success but don't set auth state yet - caller should handle login
        return { 
          success: true, 
          message: response.message 
        };
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

  const handleRequestNewOTP = async (userId) => {
    try {
      console.log('⌛ Requesting new OTP for userId:', userId);
      const response = await authService.requestNewOTP(userId);
      console.log('📨 Request new OTP response:', response);
      
      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      console.error('Request new OTP error:', error);
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
    verifyOTP: handleVerifyOTP,
    requestNewOTP: handleRequestNewOTP
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
