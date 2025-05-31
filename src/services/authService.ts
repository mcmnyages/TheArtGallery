import { AuthResponse, User } from '../types/auth';
import { setTokens, getAccessToken, clearTokens, isTokenExpired, refreshAccessToken } from './tokenService';

// Base URL for auth endpoints - removed /api/auth prefix since it's handled by the proxy
const API_BASE = '';

class AuthService {
  private async handleJsonResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    throw new Error('Invalid response type');
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
  }  async register(userData: { 
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      });

      const data = await this.handleJsonResponse(response);
      
      console.log('Register Response Status:', response.status);
      console.log('Register Response Data:', data);
      
      if (!response.ok) {
        console.error('Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }

      // Store tokens if they exist in the response
      if (data.accessToken && data.refreshToken) {
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        });
      }

      // Determine role based on email pattern
      const role = userData.email.includes('artist') ? 'artist' : 'customer';
      
      // Create a proper User object from the registration data
      const user: User = {
        id: data.id || Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: role
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
