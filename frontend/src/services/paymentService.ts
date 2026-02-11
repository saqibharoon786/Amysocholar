// services/purchaseService.ts
import api from './api';

export interface Purchase {
  _id: string;
  user: any;
  book?: any;
  judgment?: any;
  type: 'book' | 'judgment';
  format: 'pdf' | 'text';
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  paymentDetails: {
    method: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseData {
  bookId?: string;
  judgmentId?: string;
  type: 'book' | 'judgment';
  format: 'pdf' | 'text';
  paymentMethod: string;
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  type?: 'book' | 'judgment';
  paymentStatus?: string;
  userId?: string;
}

export interface PurchaseStats {
  totalPurchases: number;
  completedPurchases: number;
  pendingPurchases: number;
  totalRevenue: number;
  monthlyRevenue: number;
  bookPurchases: number;
  judgmentPurchases: number;
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

export const purchaseService = {
  createPurchase: async (data: CreatePurchaseData): Promise<ApiResponse<{ purchase: Purchase }>> => {
    const response = await api.post<ApiResponse<{ purchase: Purchase }>>('/purchase', data);
    return response.data;
  },

  getAllPurchases: async (filters: PurchaseFilters = {}): Promise<ApiResponse<{ purchases: Purchase[] }>> => {
    const response = await api.get<ApiResponse<{ purchases: Purchase[] }>>('/purchase', { params: filters });
    return response.data;
  },

  getUserPurchases: async (type?: 'book' | 'judgment', format?: 'pdf' | 'text', page: number = 1, limit: number = 10): Promise<ApiResponse<{ purchases: Purchase[] }>> => {
    const response = await api.get<ApiResponse<{ purchases: Purchase[] }>>('/purchase/my-purchases', {
      params: { type, format, page, limit }
    });
    return response.data;
  },

  getPurchaseById: async (id: string): Promise<ApiResponse<{ purchase: Purchase }>> => {
    const response = await api.get<ApiResponse<{ purchase: Purchase }>>(`/purchase/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string): Promise<ApiResponse<{ purchase: Purchase }>> => {
    const response = await api.patch<ApiResponse<{ purchase: Purchase }>>(`/purchase/${id}/status`, { paymentStatus });
    return response.data;
  },

  getPurchaseStats: async (): Promise<ApiResponse<PurchaseStats>> => {
    const response = await api.get<ApiResponse<PurchaseStats>>('/purchase/stats');
    return response.data;
  }
};