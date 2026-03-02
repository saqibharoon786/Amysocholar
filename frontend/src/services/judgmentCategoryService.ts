import api from "./api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export const judgmentCategoryService = {
  getJudgmentCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>("/judgment-category");
    return response.data;
  },

  createJudgmentCategory: async (name: string): Promise<ApiResponse<{ category: { _id: string; name: string } }>> => {
    const response = await api.post<ApiResponse<{ category: { _id: string; name: string } }>>("/judgment-category", {
      name: name.trim(),
    });
    return response.data;
  },

  deleteJudgmentCategory: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/judgment-category/${id}`);
    return response.data;
  },
};
