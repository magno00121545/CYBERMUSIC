import { 
  User, Category, Package, Song, Order, Payment, DownloadRecord, 
  Coupon, AppNotification, DashboardStats, UserRole 
} from '../types/index.js';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('cyber_music_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const authHeaders = getAuthHeaders();
  
  const headers: HeadersInit = isFormData 
    ? { ...(localStorage.getItem('cyber_music_token') ? { 'Authorization': `Bearer ${localStorage.getItem('cyber_music_token')}` } : {}) }
    : { ...authHeaders, ...(options.headers || {}) };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'Erro na requisição';
    try {
      const clonedRes = res.clone();
      try {
        const errData = await clonedRes.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch {
        errorMsg = await res.text() || errorMsg;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; demoNote?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Catalog
  getCategories: (all = false) => request<Category[]>(`/catalog/categories${all ? '?all=true' : ''}`),

  getPackages: (params: { category?: string; search?: string; filter?: string; sort?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.filter) query.set('filter', params.filter);
    if (params.sort) query.set('sort', params.sort);
    return request<Package[]>(`/catalog/packages?${query.toString()}`);
  },

  getPackageDetails: (id: string) => request<Package>(`/catalog/packages/${id}`),

  searchCatalog: (q: string) => request<{ categories: Category[]; packages: Package[]; songs: Song[] }>(`/catalog/search?q=${encodeURIComponent(q)}`),

  // Checkout & PIX
  validateCoupon: (code: string, packageId?: string) =>
    request<{ valid: boolean; code: string; discount_type: string; discount_value: number; min_order_value?: number; message: string }>('/checkout/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, packageId }),
    }),

  createOrder: (packageId: string, couponCode?: string) =>
    request<{ order: Order; payment: Payment; message: string }>('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify({ packageId, couponCode }),
    }),

  // Payments
  getPaymentStatus: (orderId: string) =>
    request<{ orderId: string; orderNumber: string; status: string; totalAmount: number; isPaid: boolean; paidAt?: string; items: any[] }>(`/payments/status/${orderId}`),

  simulatePaymentWebhook: (orderId: string) =>
    request<{ success: boolean; message: string; order: Order }>('/payments/simulate-webhook', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  // Downloads
  generateDownloadToken: (packageId: string, songId?: string) =>
    request<{ token: string; downloadUrl: string; expiresInMinutes: number }>('/downloads/generate-token', {
      method: 'POST',
      body: JSON.stringify({ packageId, songId }),
    }),

  // User Area
  getUserOrders: () => request<Order[]>('/user/orders'),
  getUserPurchases: () => request<any[]>('/user/purchases'),
  getUserDownloadsHistory: () => request<DownloadRecord[]>('/user/downloads-history'),
  getUserNotifications: () => request<AppNotification[]>('/user/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/user/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/user/notifications/mark-all-read', { method: 'PUT' }),

  // Admin Portal
  getAdminStats: () => request<DashboardStats>('/admin/stats'),
  getAdminPackages: () => request<Package[]>('/admin/packages'),
  createAdminPackage: (data: Partial<Package>) => request<Package>('/admin/packages', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminPackage: (id: string, data: Partial<Package>) => request<Package>(`/admin/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminPackage: (id: string) => request<{ success: boolean }>(`/admin/packages/${id}`, { method: 'DELETE' }),
  uploadCoverImage: (formData: FormData) => request<{ url: string }>('/admin/upload-cover', { method: 'POST', body: formData }),
  uploadPackageSongs: (packageId: string, formData: FormData) => request<{ message: string; songs: Song[]; total_tracks: number; total_size: number }>(`/admin/packages/${packageId}/upload-songs`, { method: 'POST', body: formData }),
  updateSong: (id: string, data: { title?: string; artist?: string; track_number?: number }) => request<Song>(`/admin/songs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSong: (id: string) => request<{ success: boolean }>(`/admin/songs/${id}`, { method: 'DELETE' }),

  getAdminCategories: () => request<Category[]>('/admin/categories'),
  createAdminCategory: (data: Partial<Category>) => request<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCategory: (id: string, data: Partial<Category>) => request<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCategory: (id: string) => request<{ success: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' }),

  getAdminOrders: () => request<Order[]>('/admin/orders'),
  approveOrderManual: (id: string) => request<{ success: boolean; message: string; order: Order }>(`/admin/orders/${id}/approve-manual`, { method: 'PUT' }),

  getAdminCoupons: () => request<Coupon[]>('/admin/coupons'),
  createAdminCoupon: (data: Partial<Coupon>) => request<Coupon>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminCoupon: (id: string) => request<{ success: boolean }>(`/admin/coupons/${id}`, { method: 'DELETE' }),

  getAdminUsers: () => request<any[]>('/admin/users'),
  updateUserRole: (id: string, role: UserRole) => request<{ success: boolean; user: User }>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  broadcastNotification: (data: { title: string; message: string; type?: string; link?: string }) => request<AppNotification>('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(data) }),

  getAdminBackups: () => request<Array<{ filename: string; createdAt: string; size: number }>>('/admin/backups'),
  createAdminBackup: () => request<{ filename: string; timestamp: string; size: number }>('/admin/backups/create', { method: 'POST' }),
  restoreAdminBackup: (filename: string) => request<{ success: boolean; message: string }>('/admin/backups/restore', { method: 'POST', body: JSON.stringify({ filename }) }),

  getAdminLogs: () => request<any[]>('/admin/logs'),
};
