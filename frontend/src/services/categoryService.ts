import api from "./api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export const categoryService = {
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>("/category");
    return response.data;
  },

  createCategory: async (name: string): Promise<ApiResponse<{ category: { _id: string; name: string } }>> => {
    const response = await api.post<ApiResponse<{ category: { _id: string; name: string } }>>("/category", { name: name.trim() });
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/category/${id}`);
    return response.data;
  },
};
