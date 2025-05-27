import { AuthResponse, User } from '../types/auth';
import { setTokens, getAccessToken, clearTokens, isTokenExpired, refreshAccessToken } from './tokenService';

// Real API endpoint base URL
const API_BASE = '/api/v0.1/users';

class AuthService {
  private async handleJsonResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error('Invalid response format from server');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await this.handleJsonResponse(response);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
      
      // Check for required tokens in the response
      if (!data.accessToken || !data.refreshToken) {
        console.error('Invalid response structure:', data);
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }

      // Store tokens using tokenService
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      // Extract user info from JWT token
      const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1]));
      
      // Create a proper User object from the token payload and email pattern
      const user: User = {
        id: tokenPayload.id || data.id,
        firstName: tokenPayload.firstName || data.firstName,
        lastName: tokenPayload.lastName || data.lastName,
        email: tokenPayload.email || email,
        role: email.includes('artist') ? 'artist' : 'customer'
      };

      return {
        success: true,
        user,
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return {
        success: false,
        error: message
      };
    }
  }

  async register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await this.handleJsonResponse(response);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }

      // Check for required tokens in the response
      if (!data.accessToken || !data.refreshToken || !data.id) {
        console.error('Invalid response structure:', data);
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }

      // Store tokens using tokenService
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });      // Determine role based on email pattern during registration
      const role = userData.email.includes('artist') ? 'artist' : 
                   userData.email.includes('client') ? 'customer' : 'customer';
      
      // Create a proper User object from the response data
      const user: User = {
        id: data.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: role // Set role based on email pattern
      };

      return {
        success: true,
        user,
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return {
        success: false,
        error: message
      };
    }
  }

  logout(): void {
    clearTokens();
  }

  isAuthenticated(): boolean {
    return getAccessToken() !== null && !isTokenExpired();
  }

  async refreshToken(): Promise<boolean> {
    try {
      const newTokens = await refreshAccessToken();
      return !!newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    if (isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        throw new Error('Failed to refresh authentication token');
      }
    }

    return {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
}

export const authService = new AuthService();
