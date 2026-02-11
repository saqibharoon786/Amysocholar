// services/bookService.ts
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const constructImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/placeholder-book.png';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Construct full URL
  return `${API_BASE_URL}/${cleanPath}`;
};

export interface Book {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  author: string;
  authorBio?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  price: number;
  currency: string;
  discountPercentage?: number;
  discountedPrice?: number;
  isbn?: string;
  language: string;
  totalPages: number;
  // ✅ FIXED: Changed from coverImage to coverImages (array)
  coverImages: string[];
  pdfFile?: string;
  textFile?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploader: any;
  approvedBy?: any;
  viewCount: number;
  downloadCount: number;
  purchaseCount: number;
  averageRating: number;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  newRelease: boolean;
  metaDescription?: string;
  previewPages: any[];
  createdAt: string;
  updatedAt: string;
}

export interface BookFilters {
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface UploadBookData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags?: string;
  author: string;
  authorBio?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  price: number;
  currency?: string;
  discountPercentage?: number;
  isbn?: string;
  language: string;
  totalPages: number;
  metaDescription?: string;
  previewPages?: string;
}

export interface PurchaseBookData {
  format: 'pdf' | 'text';
  paymentMethod: string;
}

export interface UpdateBookData {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags?: string;
  author?: string;
  authorBio?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  price?: number;
  currency?: string;
  discountPercentage?: number;
  isbn?: string;
  language?: string;
  totalPages?: number;
  metaDescription?: string;
  previewPages?: string;
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
}

export interface BookPreview {
  book: {
    _id: string;
    title: string;
    author: string;
    // ✅ FIXED: Changed from coverImage to coverImages
    coverImages: string[];
    description: string;
    price: number;
    discountedPrice: number;
    currency: string;
  };
  previewPages: Array<{
    pageNumber: number;
    content: string;
    isFree: boolean;
  }>;
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

export interface Category {
  _id?: string;
  name: string;
  bookCount?: number;
  totalViews?: number;
}

export interface PopularCategory {
  _id: string;
  name: string;
  bookCount: number;
  totalViews: number;
}

// Helper to process book data and add full URLs
const processBookData = (book: Book): Book => {
  const processedBook = {
    ...book,
    // Convert relative paths to full URLs for cover images
    coverImages: book.coverImages?.map(img => constructImageUrl(img)) || []
  };

  return processedBook;
};

const processBooksData = (books: Book[]): Book[] => {
  return books.map(processBookData);
};

export const BookService = {
  // ================== 📘 PUBLIC ROUTES ==================
  getAllBooks: async (filters: BookFilters = {}): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/get-all-books', { params: filters });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getApprovedBooks: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/approved', {
      params: { page, limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getBookById: async (id: string): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.get<ApiResponse<{ book: Book }>>(`/book/get-book/${id}`);
    if (response.data.success && response.data.data?.book) {
      response.data.data.book = processBookData(response.data.data.book);
    }
    return response.data;
  },

  getBookPreview: async (id: string): Promise<ApiResponse<BookPreview>> => {
    const response = await api.get<ApiResponse<BookPreview>>(`/book/${id}/preview`);
    if (response.data.success && response.data.data?.book) {
      response.data.data.book.coverImages = response.data.data.book.coverImages?.map(img => constructImageUrl(img)) || [];
    }
    return response.data;
  },

  searchBooks: async (q: string, filters: Partial<BookFilters> = {}): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/search', {
      params: { q, ...filters }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getBooksByCategory: async (category: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>(`/book/category/${category}`, {
      params: { page, limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getFeaturedBooks: async (limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/featured', {
      params: { limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getBestsellerBooks: async (limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/bestsellers', {
      params: { limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  getNewReleases: async (limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/new-releases', {
      params: { limit }
    });
    console.log("📚 New releases raw response:", response);
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
      console.log("🖼️ Processed books with images:", response.data.data.books);
    }
    return response.data;
  },

  incrementViewCount: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/book/${id}/view`);
    return response.data;
  },

  // ================== 👩‍💼 ADMIN ROUTES ==================
  uploadBook: async (formData: FormData): Promise<ApiResponse<{ book: Book }>> => {
    console.log("Uploading book with formData:", formData); 
    const response = await api.post<ApiResponse<{ book: Book }>>('/book/upload-book', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (response.data.success && response.data.data?.book) {
      response.data.data.book = processBookData(response.data.data.book);
    }
    return response.data;
  },

  getMyBooks: async (status?: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/my/books', {
      params: { status, page, limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

// services/bookService.ts
updateBook: async (id: string): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/book/update/my/books/${id}`);
  return response.data;
},

  deleteBook: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/book/my/books/${id}`);
    return response.data;
  },

  // ================== 🧑‍⚖️ SUPERADMIN ROUTES ==================
  getPendingBooks: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{ books: Book[] }>> => {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/book/admin/pending', {
      params: { page, limit }
    });
    if (response.data.success && response.data.data?.books) {
      response.data.data.books = processBooksData(response.data.data.books);
    }
    return response.data;
  },

  approveBook: async (id: string): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.patch<ApiResponse<{ book: Book }>>(`/book/admin/${id}/approve`);
    if (response.data.success && response.data.data?.book) {
      response.data.data.book = processBookData(response.data.data.book);
    }
    return response.data;
  },

  rejectBook: async (id: string, reason: string): Promise<ApiResponse<{ book: Book }>> => {
    const response = await api.patch<ApiResponse<{ book: Book }>>(`/book/admin/${id}/reject`, { reason });
    if (response.data.success && response.data.data?.book) {
      response.data.data.book = processBookData(response.data.data.book);
    }
    return response.data;
  },

  // ================== 👤 CUSTOMER ROUTES ==================
  purchaseBook: async (id: string, data: PurchaseBookData): Promise<ApiResponse<{ purchase: any }>> => {
    const response = await api.post<ApiResponse<{ purchase: any }>>(`/book/${id}/purchase`, data);
    return response.data;
  },

  getMyPurchasedBooks: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{ purchases: any[] }>> => {
    const response = await api.get<ApiResponse<{ purchases: any[] }>>('/book/my/purchases', {
      params: { page, limit }
    });
    return response.data;
  },

  readFullBook: async (id: string, format: 'pdf' | 'text' = 'text'): Promise<ApiResponse<{
    book: Book;
    filePath: string;
    format: string;
    isFree: boolean;
    totalPages: number;
  }>> => {
    const response = await api.get<ApiResponse>(`/book/${id}/read`, { params: { format } });
    if (response.data.success && response.data.data?.book) {
      response.data.data.book = processBookData(response.data.data.book);
    }
    return response.data;
  },

  checkPurchaseStatus: async (id: string): Promise<ApiResponse<{ hasPurchased: boolean; purchase: any }>> => {
    const response = await api.get<ApiResponse<{ hasPurchased: boolean; purchase: any }>>(`/book/${id}/check-purchase`);
    return response.data;
  },

  updateBookRating: async (id: string, rating: number): Promise<ApiResponse<{ averageRating: number; reviewCount: number }>> => {
    const response = await api.patch<ApiResponse<{ averageRating: number; reviewCount: number }>>(`/book/${id}/rating`, { rating });
    return response.data;
  },

  getAllCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>('/book/categories/all');
    return response.data;
  },

  getPopularCategories: async (): Promise<ApiResponse<PopularCategory[]>> => {
    const response = await api.get<ApiResponse<PopularCategory[]>>('/book/categories/popular');
    return response.data;
  },
};