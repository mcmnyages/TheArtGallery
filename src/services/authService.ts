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
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
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
          error: data.error || data.message || 'Invalid credentials. Please check your email and password.'
        };
      }

      // Handle 2xx responses that might still indicate an error
      if (data.error) {
        return {
          success: false,
          error: data.error
        };
      }
      
      // Check for required tokens in the response
      if (!data.accessToken || !data.refreshToken) {
        console.error('Invalid response structure:', data);
        return {
          success: false,
          error: 'Invalid server response. Please try again.'
        };
      }

      // Store tokens using tokenService
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      // Extract user info from JWT token or response data
      const user: User = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: email,
        role: data.role || (email.includes('artist') ? 'artist' : 'customer')
      };

      return {
        success: true,
        user,
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
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
