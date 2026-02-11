// services/authService.ts
import api from './api';

// Types
export type UserRole = 'customer' | 'admin' | 'superadmin';
export type VerificationMethod = 'email' | 'sms';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  profileCompleted: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    user: User;
  };
  message?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  verificationMethod?: VerificationMethod;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationData {
  email: string;
  verificationMethod?: VerificationMethod;
}

export interface ForgotPasswordData {
  email: string;
  verificationMethod?: VerificationMethod;
}

export interface ResetPasswordData {
  email: string;
  verificationCode: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// API calls
export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (data: ResendVerificationData): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/resend-verification', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/change-password', data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },
};