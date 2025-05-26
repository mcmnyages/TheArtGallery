/**
 * TokenService handles authentication token storage and management
 */

const TOKEN_KEY = 'kabbala_auth_tokens';

/**
 * Store authentication tokens in local storage
 * @param {Object} tokens - Object containing access token, refresh token, etc.
 */
export const setTokens = (tokens) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

/**
 * Get all stored authentication tokens
 * @returns {Object|null} - Stored tokens or null if not found
 */
export const getTokens = () => {
  try {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    return tokenData ? JSON.parse(tokenData) : null;
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
    }
    
    // Mock token refresh for demo purposes
    // In a real app, this would be an API call to your auth endpoint
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new mock tokens
    const newTokens = {
      accessToken: 'new-mock-access-token',
      refreshToken: refreshToken,
      deviceToken: getTokens()?.deviceToken || 'mock-device-token'
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