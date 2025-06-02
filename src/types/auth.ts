export interface Resource {
  name: string;
  status: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userResources?: Resource[];
}

export interface AuthSuccessResponse {
  success: true;
  user: User;
  token: string;
  refreshToken: string;
  message?: string;
  error?: string;

}

export interface AuthErrorResponse {
  success: false;
  error: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
