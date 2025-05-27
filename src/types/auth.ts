export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'artist' | 'customer';
}

export interface AuthSuccessResponse {
  success: true;
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
