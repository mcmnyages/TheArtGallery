/**
 * TokenService handles authentication token storage and management
 */

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY;

/**
 * Store authentication tokens in local storage
 * @param {Object} tokens - Object containing access token, refresh token, etc.
 */
export const setTokens = ({ accessToken, refreshToken }) => {
  console.log('Setting tokens:', { accessToken, refreshToken });
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get all stored authentication tokens
 * @returns {Object|null} - Stored tokens or null if not found
 */
export const getTokens = () => {
  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      console.log('Retrieved tokens:', { accessToken, refreshToken });
    
    if (!accessToken || !refreshToken) {
      return null;
    }
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
};

/**
 * Get the access token
 * @returns {string|null} - Access token or null if not found
 */
export const getAccessToken = () => {
  const tokens = getTokens();
  return tokens?.accessToken || null;
};

/**
 * Get the refresh token
 * @returns {string|null} - Refresh token or null if not found
 */
export const getRefreshToken = () => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};

/**
 * Clear all stored tokens (for logout)
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if token is expired
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = () => {
  try {
    const tokens = getTokens();
    if (!tokens || !tokens.accessToken) {
      return true;
    }
    
    // Extract payload from JWT token
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    
    // Check if token is expired (with 60-second buffer)
    return Date.now() >= expirationTime - 60000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<Object>} - New tokens
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }    const response = await fetch('/api/v0.1/users/token/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }    const data = await response.json();
    const newTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };

    // Store the new tokens
    setTokens(newTokens);
    
    return newTokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    throw error;
  }
};