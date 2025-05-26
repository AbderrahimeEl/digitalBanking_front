export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
  customerId?: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  role: string;
  customerId?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  customerId?: number;
  token?: string;
  refreshToken?: string;
}
