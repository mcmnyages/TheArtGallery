import { createContext } from 'react';

// Create context with default values
export const AuthContext = createContext({
  isAuthenticated: false,
  isVerified: false,
  user: null,
  userResources: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {},
  verifyAccess: () => {},
  verifyOTP: () => {},
  requestNewOTP: () => {}
});
