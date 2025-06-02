import { AuthResponse, User } from '../types/auth';
import { setTokens, getAccessToken, clearTokens, isTokenExpired, refreshAccessToken } from './tokenService';
import { jwtDecode } from 'jwt-decode';

// Interface for decoded token payload
interface DecodedToken {
  sub: string;          // subject (usually user ID)
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  exp: number;          // expiration timestamp
  iat: number;          // issued at timestamp
  userResources?: Array<{ name: string; status: string }>;

  status: string;       // user account status (active/inactive)
}

// Base URL for auth endpoints - removed /api/auth prefix since it's handled by the proxy
const API_BASE = '';

class AuthService {
  /**
   * Decodes a JWT token and returns the payload
   * @param token Optional token to decode. If not provided, uses the current access token
   * @returns The decoded token payload or null if invalid
   */
  decodeToken(token?: string): DecodedToken | null {
    try {
      const tokenToDecode = token || getAccessToken();
      if (!tokenToDecode) {
        return null;
      }
      
      return jwtDecode<DecodedToken>(tokenToDecode);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Gets the current user's details from the token
   * @returns User details from the token or null if no valid token exists
   */
  getUserDetailsFromToken(): Partial<User> | null {
    const decoded = this.decodeToken();
    if (!decoded) {
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      userResources: decoded.userResources || []
    };
  }

  /**
   * Checks if the user has a specific role
   * @param role The role to check for
   * @returns true if the user has the role, false otherwise
   */
  hasRole(role: string): boolean {
    const decoded = this.decodeToken();
    return decoded?.roles?.includes(role) || false;
  }

  /**
   * Logs the decoded token details to the console in a readable format
   * @param token Optional token to decode. If not provided, uses the current access token
   */
  logTokenDetails(token?: string): void {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      console.log('No valid token found or token could not be decoded');
      return;
    }

    console.group('Decoded Token Details:');
    console.log('User ID:', decoded.sub);
    console.log('Email:', decoded.email);
    console.log('Name:', `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() || 'Not provided');
    console.log('Roles:', decoded.roles?.length ? decoded.roles.join(', ') : 'No roles');
    console.log('Resources:', decoded.userResources?.length ? 
      decoded.userResources.map(r => `${r.name} (${r.status})`).join(', ') : 
      'No resources'
    );
    console.log('Expiration:', new Date(decoded.exp * 1000).toLocaleString());
    console.log('Issued At:', new Date(decoded.iat * 1000).toLocaleString());
    console.groupEnd();
  }

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

      // Decode the token to check user status
      const decodedToken = this.decodeToken(data.accessToken);
      if (!decodedToken) {
        return {
          success: false,
          error: 'Invalid token received'
        };
      }

      // Check user status
      if (decodedToken.status === 'inactive') {
        return {
          success: false,
          requireOTP: true,
          userId: decodedToken.sub,
          error: 'Email verification required'
        };
      }

      // For active users, proceed with normal login flow
      const resources = await this.checkAccessibleResources(data.accessToken);
      
      const user: User = {
        id: decodedToken.sub,
        firstName: decodedToken.firstName || '',
        lastName: decodedToken.lastName || '',
        email: decodedToken.email,
        userResources: resources,
        status: decodedToken.status
      };

      // Set tokens only for active users
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });

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
      });      const data = await this.handleJsonResponse(response);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed'
        };
      }

      return {
        success: true,
        message: data.message,
        user: {
          id: data.userId, // Using the userId from the registration response
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
  }  async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('📤 Sending OTP verification request:', { userId, otp });
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await this.handleJsonResponse(response);
      console.log('📨 Raw OTP verification response:', data);
      
      if (!response.ok) {
        console.error('❌ OTP verification failed:', data.error);
        return {
          success: false,
          error: data.error || 'OTP verification failed'
        };
      }

      // The backend returns just true for success
      if (data === true) {
        console.log('✅ OTP verified successfully');
        return {
          success: true,
          message: '2FA verified successfully'
        };
      }

      // If we didn't get the expected success message
      console.error('❌ Unexpected OTP verification response:', data);
      return {
        success: false,
        error: 'Invalid verification response'
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
