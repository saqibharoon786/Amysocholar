// services/judgmentService.ts
import api from './api';

export interface Judgment {
  _id: string;
  citation: string;
  caseNumber?: string;
  parties: string;
  caseTitle: string;
  court: string;
  judge?: string;
  caseType: string;
  category: string;
  year: number;
  decisionDate?: string;
  keywords: string[];
  summary?: string;
  price: number;
  currency: string;
  pdfFile?: string;
  // New: full text stored directly in the judgment
  textContent?: string;
  textFormat?: string; // 'plain' | 'html' | 'markdown'
  // Backwards-compat: optional legacy text file path
  textFile?: string;
  uploader: any;
  viewCount: number;
  purchaseCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JudgmentFilters {
  page?: number;
  limit?: number;
  court?: string;
  caseType?: string;
  category?: string;
  year?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UploadJudgmentData {
  citation: string;
  caseNumber?: string;
  parties: string;
  caseTitle: string;
  court: string;
  judge?: string;
  caseType: string;
  category: string;
  year: number;
  decisionDate?: string;
  keywords?: string;
  summary?: string;
  price: number;
  currency?: string;
}

export interface UpdateJudgmentData {
  citation?: string;
  caseNumber?: string;
  parties?: string;
  caseTitle?: string;
  court?: string;
  judge?: string;
  caseType?: string;
  category?: string;
  year?: number;
  decisionDate?: string;
  keywords?: string;
  summary?: string;
  price?: number;
  currency?: string;
  isFeatured?: boolean;
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

export const JudgmentService = {
  // ================== ⚖️ PUBLIC ROUTES ==================
  getAllJudgments: async (filters: JudgmentFilters = {}): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>('/judgments/get-all-judgment', { params: filters });
    return response.data;
  },

  getJudgmentById: async (id: string): Promise<ApiResponse<{ judgment: Judgment }>> => {
    const response = await api.get<ApiResponse<{ judgment: Judgment }>>(`/judgments/${id}`);
    return response.data;
  },

  getFeaturedJudgments: async (): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>('/judgments/featured');
    return response.data;
  },

  searchJudgments: async (q: string, court?: string, category?: string, yearFrom?: number, yearTo?: number, page: number = 1, limit: number = 10): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>('/judgments/search', {
      params: { q, court, category, yearFrom, yearTo, page, limit }
    });
    return response.data;
  },

  getJudgmentsByCourt: async (court: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>(`/judgments/court/${court}`, {
      params: { page, limit }
    });
    return response.data;
  },

  getJudgmentsByYear: async (year: number, page: number = 1, limit: number = 10): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>(`/judgments/year/${year}`, {
      params: { page, limit }
    });
    return response.data;
  },

  getJudgmentsByCategory: async (category: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ judgments: Judgment[] }>> => {
    const response = await api.get<ApiResponse<{ judgments: Judgment[] }>>(`/judgments/category/${category}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
  uploadJudgment: async (formData: FormData): Promise<ApiResponse<{ judgment: Judgment }>> => {
    const response = await api.post<ApiResponse<{ judgment: Judgment }>>('/judgments/upload-judgment-book', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateJudgment: async (id: string, formData: FormData): Promise<ApiResponse<{ judgment: Judgment }>> => {
    const response = await api.patch<ApiResponse<{ judgment: Judgment }>>(`/judgments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteJudgment: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/judgments/${id}`);
    return response.data;
  },

  // ================== 👤 CUSTOMER ROUTES ==================
  purchaseJudgment: async (id: string, paymentMethod: string = 'bank'): Promise<ApiResponse<{ purchase: any }>> => {
    const response = await api.post<ApiResponse<{ purchase: any }>>(`/judgments/${id}/purchase`, { paymentMethod });
    return response.data;
  },

  readJudgment: async (id: string): Promise<ApiResponse<{
    judgment: Judgment;
    textFile: string;
    format: string;
    isFree: boolean;
  }>> => {
    const response = await api.get<ApiResponse>(`/judgments/${id}/read`);
    return response.data;
  },

  getMyPurchasedJudgments: async (): Promise<ApiResponse<{ purchases: any[] }>> => {
    const response = await api.get<ApiResponse<{ purchases: any[] }>>('/judgments/my-purchases/judgments');
    return response.data;
  }
};