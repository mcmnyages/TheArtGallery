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
      
      if (!response.ok || !data.accessToken) {
        return {
          success: false,
          error: data.error || 'Invalid credentials'
        };
      }

      // Immediately check resources after successful login
      console.log('Checking resources with token:', data.accessToken);
      const resources = await this.checkAccessibleResources(data.accessToken);
      
      const user = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: email,
        userResources: resources
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }    async register(userData: { 
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
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
          error: data.error || 'Registration failed'
        };
      }

      return {
        success: true,
        user: {
          id: data.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          userResources: []
        },
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
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
  async checkAccessibleResources(token: string): Promise<Array<{ name: string; status: string }>> {
    try {
      console.log('Checking accessible resources with token:', token.substring(0, 10) + '...');
      
      const response = await fetch('/resource/accessibleResources', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Resource check failed:', response.status);
        return [{
          name: 'Consumer_content',
          status: 'success'
        }];
      }

      const data = await response.json();
      console.log('Raw resource response:', data);

      // Simple array normalization
      let resources = Array.isArray(data) ? data : 
                     Array.isArray(data.resources) ? data.resources :
                     Array.isArray(data.data) ? data.data : [];

      // Normalize and validate each resource
      resources = resources
        .filter(resource => 
          resource && 
          typeof resource === 'object' && 
          typeof resource.name === 'string' &&
          typeof resource.status === 'string'
        )
        .map(resource => this.normalizeResource(resource));

      console.log('Normalized resources:', resources);

      return resources.length > 0 ? resources : [{
        name: 'Consumer_content',
        status: 'success'
      }];
    } catch (error) {
      console.error('Error checking resources:', error);
      return [{
        name: 'Consumer_content',
        status: 'success'
      }];
    }
  }

  private normalizeResource(resource: { name: string; status: string }): { name: string; status: string } {
    const nameMap: { [key: string]: string } = {
      'artist': 'Artwork',
      'ARTWORK': 'Artwork',
      'artwork': 'Artwork',
      'ARTIST': 'Artwork',
      'Artist': 'Artwork',
      'admin': 'Admin_dashboard',
      'ADMIN': 'Admin_dashboard',
      'consumer': 'Consumer_content',
      'CONSUMER': 'Consumer_content',
      'Customer': 'Consumer_content'
    };

    // If it's already a valid resource name, return as is
    if (Object.values(nameMap).includes(resource.name)) {
      console.log('Resource already normalized:', resource.name);
      return resource;
    }

    // Try to map the resource name
    const normalizedName = nameMap[resource.name] || 'Consumer_content';
    console.log('Normalizing resource:', resource.name, 'to:', normalizedName);

    return {
      ...resource,
      name: normalizedName
    };
  }

  async getAuthToken(): Promise<string | null> {
    const token = getAccessToken();

    if (!token) {
      console.error('No authentication token available');
      return null;
    }

    // Check if token is expired and try to refresh if needed
    if (isTokenExpired()) {
      console.log('Token expired, attempting refresh...');
      try {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          console.error('Token refresh failed');
          return null;
        }
        // Get fresh token after refresh
        return getAccessToken();
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }

    return token;
  }

  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await this.handleJsonResponse(response);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'OTP verification failed'
        };
      }

      // After successful OTP verification, return the full user data with tokens
      return {
        success: true,
        user: {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          userResources: []
        },
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  async requestNewOTP(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await this.handleJsonResponse(response);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to request new OTP'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Request OTP error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}

export const authService = new AuthService();
