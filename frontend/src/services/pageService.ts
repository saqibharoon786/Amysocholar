// services/pageService.ts
import api from './api';

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageData {
  title: string;
  content: string;
  type: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
}

export interface UpdatePageData {
  title?: string;
  content?: string;
  type?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
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

export const pageService = {
  // ================== 📄 PUBLIC ROUTES ==================
  getAllPages: async (type?: string, isActive?: boolean, page: number = 1, limit: number = 10): Promise<ApiResponse<{ pages: Page[] }>> => {
    const response = await api.get<ApiResponse<{ pages: Page[] }>>('/page/get-all-pages', {
      params: { type, isActive, page, limit }
    });
    return response.data;
  },

  getPageBySlug: async (slug: string): Promise<ApiResponse<{ page: Page }>> => {
    const response = await api.get<ApiResponse<{ page: Page }>>(`/page/${slug}`);
    return response.data;
  },

  getPagesByType: async (type: string): Promise<ApiResponse<{ pages: Page[] }>> => {
    const response = await api.get<ApiResponse<{ pages: Page[] }>>(`/page/type/${type}`);
    return response.data;
  },

  getPageById: async (id: string): Promise<ApiResponse<{ page: Page }>> => {
    const response = await api.get<ApiResponse<{ page: Page }>>(`/page/get-page/${id}`);
    return response.data;
  },

  // ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
  createPage: async (data: CreatePageData): Promise<ApiResponse<{ page: Page }>> => {
    const response = await api.post<ApiResponse<{ page: Page }>>('/page/create-page', data);
    return response.data;
  },

  updatePage: async (id: string, data: UpdatePageData): Promise<ApiResponse<{ page: Page }>> => {
    const response = await api.patch<ApiResponse<{ page: Page }>>(`/page/update-page/${id}`, data);
    return response.data;
  },

  deletePage: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/page/delete-page/${id}`);
    return response.data;
  },

  togglePageStatus: async (id: string): Promise<ApiResponse<{ page: Page }>> => {
    const response = await api.patch<ApiResponse<{ page: Page }>>(`/page/${id}/toggle-status`);
    return response.data;
  }
};