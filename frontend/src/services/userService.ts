// services/userService.ts
import api from './api';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'superadmin';
  profileImage?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profession?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  cnic?: {
    number?: string;
    frontImage?: string;
    backImage?: string;
    verified: boolean;
  };
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  totalSales?: number;
  totalEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profession?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalCustomers: number;
  pendingVerifications: number;
}

export interface CustomerStats {
  totalPurchases: number;
  totalFavorites: number;
  totalSpent: number;
}

export interface CNICVerificationData {
  cnicNumber: string;
  frontImage: File;
  backImage: File;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    current: number;
    total: number;
    results: number;
  };
}

export const userService = {
  // ================== 👤 USER ROUTES ==================
  getProfile: async (): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>('/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.patch<ApiResponse<{ user: UserProfile }>>('/user/update-profile', data);
    return response.data;
  },

  updatePassword: async (data: ChangePasswordData): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>('/user/change-password', data);
    return response.data;
  },

  uploadProfileImage: async (formData: FormData): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.patch<ApiResponse<{ user: UserProfile }>>('/user/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  verifyCNIC: async (formData: FormData): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.post<ApiResponse<{ user: UserProfile }>>('/user/verify-cnic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getCustomerStats: async (): Promise<ApiResponse<CustomerStats>> => {
    const response = await api.get<ApiResponse<CustomerStats>>('/user/customer/stats');
    return response.data;
  },

  // ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
  getAllUsers: async (filters: UserFilters = {}): Promise<ApiResponse<{ users: UserProfile[] }>> => {
    const response = await api.get<ApiResponse<{ users: UserProfile[] }>>('/user/get-users', { params: filters });
    return response.data;
  },

  getAdminStats: async (): Promise<ApiResponse<AdminStats>> => {
    const response = await api.get<ApiResponse<AdminStats>>('/user/stats');
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>(`/user/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: { role?: string; isActive?: boolean; isVerified?: boolean; cnic?: { verified: boolean } }): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.patch<ApiResponse<{ user: UserProfile }>>(`/user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/user/${id}`);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.patch<ApiResponse<{ user: UserProfile }>>(`/user/${id}/deactivate`);
    return response.data;
  }
};