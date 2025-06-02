export interface Resource {
  name: string;
  status: string;
}

export interface User {
  id: string;
  firstName?: string;  // Made optional since token might not have it
  lastName?: string;   // Made optional since token might not have it
  email: string;
  userResources?: Resource[];
  status?: string;     // Added status field
}

export interface AuthSuccessResponse {
  success: true;
  user: User;
  token: string;
  refreshToken: string;
  message?: string;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  requireOTP?: boolean;
  userId?: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
