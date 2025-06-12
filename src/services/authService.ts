import { AuthResponse, User } from '../types/auth';
import { setTokens, getAccessToken, clearTokens, isTokenExpired, refreshAccessToken } from './tokenService';
import { jwtDecode } from 'jwt-decode';

// Interface for decoded token payload
interface DecodedToken {
  id: string;          // subject (usually user ID)
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
   * Add a policy for a user to access a resource
   * @param principal The user's email
   * @param resource The resource name
   * @param action The action to allow ('read', 'write', etc.)
   * @returns Promise that resolves when the policy is added
   */
  async addPolicy(principal: string, resource: string, action: string): Promise<void> {
    try {      console.log('🔒 Adding policy:', { principal, resource, action });
      const headers = await this.getAuthHeaders();
      
      console.log("Sending this data to the add Policy endpoint", principal,resource,action)
      
      const response = await fetch('/policy/add', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',        body: JSON.stringify([{
            principal,
            resource,
            action,
            effect: 'allow'
          }])
      });

      if (!response.ok) {
        const data = await this.handleJsonResponse(response);
        throw new Error(data.error || 'Failed to add policy');
      }

      console.log('✅ Policy added successfully');
    } catch (error) {
      console.error('❌ Error adding policy:', error);
      throw error;
    }
  }

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
      id: decoded.id,
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
    console.log('User ID:', decoded.id);
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
      console.log('🔐 Starting login process for:', email);
      
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
      console.log('📥 Login response received:', { 
        status: response.status,
        ok: response.ok,
        hasAccessToken: !!data.accessToken
      });
      
      // Try to decode the token if it exists
      const decodedToken = data.accessToken ? this.decodeToken(data.accessToken) : null;
      console.log('🔑 Raw decoded token:', decodedToken);

      // Extract user info from token or response data
      const userId = data.userId || decodedToken?.id;
      const userEmail = data.email || decodedToken?.email || email;
      const userStatus = data.status || decodedToken?.status || 'inactive';
      const firstName = decodedToken?.firstName || data.firstName || '';
      const lastName = decodedToken?.lastName || data.lastName || '';

      console.log('👤 User info:', { userId, email: userEmail, status: userStatus });

      // Ensure we have a userId
      if (!userId) {
        console.error('❌ No userId found in response');
        // Return error response with empty userId as required by type
        return {
          success: false,
          error: 'Server error: User ID not provided',
          userId: ''
        };
      }

      // Create base user object
      const userInfo: User = {
        id: userId,
        email: userEmail,
        firstName,
        lastName,
        status: userStatus,
        userResources: []
      };

      // Handle verification required case
      if (!response.ok || !data.accessToken || userStatus === 'inactive') {
        console.log('⚠️ OTP verification required or login unsuccessful');
        const errorResponse: AuthResponse = {
          success: false,
          requireOTP: userStatus === 'inactive',
          userId: userId,
          error: data.error || 'Email verification required',
          user: userInfo
        };
        console.log('📤 Sending error response:', errorResponse);
        return errorResponse;
      }

      // For active users with valid tokens, proceed with normal login flow
      console.log('✅ User is active, proceeding with login');
      const resources = await this.checkAccessibleResources(data.accessToken);
      console.log('📦 User resources:', resources);
      
      userInfo.userResources = resources;

      // Set tokens only for active users
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      console.log('🎉 Login successful - tokens set');

      // Return success response without userId field
      const successResponse: AuthResponse = {
        success: true,
        user: userInfo,
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
      console.log('📤 Sending success response:', successResponse);
      return successResponse;

    } catch (error) {
      console.error('🔥 Login error:', error);
      // Return error response with empty userId as required by type
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        userId: ''
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
          error: data.error || 'Registration failed',
          userId: data.userId || '', // Include userId in error response
        };
      }

      if (!data.userId) {
        return {
          success: false,
          error: 'Server error: User ID not provided',
          userId: '',
        };
      }

      return {
        success: true,
        message: data.message,
        user: {
          id: data.userId,
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        userId: '',
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
  }  async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('📤 Starting OTP verification for user:', userId);
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await this.handleJsonResponse(response);
      console.log('📥 OTP verification response:', {
        status: response.status,
        ok: response.ok,
        data
      });
      
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
      console.error('🔥 OTP verification error:', error);
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
  async getAllResources(): Promise<Array<any>> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching all resources...');
      
      const response = await fetch('/resource/all', {
        method: 'GET',
        credentials: 'include',
        headers
      });      if (!response.ok) {
        console.error('❌ Failed to fetch resources:', response.status);
        throw new Error('Failed to fetch resources');
      }
      
      const data = await this.handleJsonResponse(response);
      if (data && data.status === 'success' && Array.isArray(data.data)) {
        // Filter to only show Artwork resource
        const artworkResources = data.data.filter(resource => resource.name === 'Artwork');
        console.log('✅ Artwork resources:', artworkResources);
        return artworkResources;
      }

      console.error('❌ Invalid response format:', data);
      return [];

    } catch (error) {
      console.error('🔥 Error fetching resources:', error);
      return [];
    }
  }

  async approveQRToken(qrToken: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('🔐 Starting QR token approval process');        const response = await fetch(`${API_BASE}/qrcode/token_approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ qrToken }),
      });

      const data = await this.handleJsonResponse(response);
      console.log('📥 QR token approval response:', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      if (!response.ok) {
        console.error('❌ QR token approval failed:', data.error);
        return {
          success: false,
          error: data.error || 'QR token approval failed'
        };
      }

      return {
        success: true,
        message: data.message || 'QR token approved successfully'
      };

    } catch (error) {
      console.error('🔥 QR token approval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}

export const authService = new AuthService();
