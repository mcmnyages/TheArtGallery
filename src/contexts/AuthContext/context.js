import { createContext } from 'react';

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
