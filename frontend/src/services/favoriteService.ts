// services/favoriteService.ts
import api from './api';

export interface Favorite {
  _id: string;
  user: string;
  book?: any;
  judgment?: any;
  type: 'book' | 'judgment';
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteData {
  bookId?: string;
  judgmentId?: string;
  type: 'book' | 'judgment';
}

export interface FavoriteStatus {
  bookId?: string;
  judgmentId?: string;
  type: 'book' | 'judgment';
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

export const favoriteService = {
  // ================== ❤️ CUSTOMER ROUTES ==================
  getUserFavorites: async (type?: 'book' | 'judgment', page: number = 1, limit: number = 10): Promise<ApiResponse<{ favorites: Favorite[] }>> => {
    const response = await api.get<ApiResponse<{ favorites: Favorite[] }>>('/favorite/get-all-favorite-books', {
      params: { type, page, limit }
    });
    return response.data;
  },

  addToFavorites: async (data: FavoriteData): Promise<ApiResponse<{ favorite: Favorite }>> => {
    const response = await api.post<ApiResponse<{ favorite: Favorite }>>('/favorite/add-to-favorite', data);
    return response.data;
  },

  removeFromFavorites: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/favorite/remove-book/${id}`);
    return response.data;
  },

  checkFavoriteStatus: async (data: FavoriteStatus): Promise<ApiResponse<{ isFavorite: boolean; favoriteId?: string }>> => {
    const response = await api.get<ApiResponse<{ isFavorite: boolean; favoriteId?: string }>>('/favorite/check', {
      params: data
    });
    return response.data;
  }
};