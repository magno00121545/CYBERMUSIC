export type UserRole = 'ADMIN' | 'EDITOR' | 'SUPORTE' | 'USER';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  packages_count?: number;
  created_at: string;
}

export interface Song {
  id: string;
  package_id: string;
  title: string;
  artist: string;
  duration_seconds: number;
  file_path: string;
  file_size: number; // in bytes
  file_format: 'mp3' | 'wav' | 'flac' | 'm4a';
  preview_url?: string;
  track_number: number;
  created_at: string;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  cover_image: string;
  price: number; // in BRL
  discount_price?: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  display_order: number;
  total_size: number; // in bytes
  total_tracks: number;
  created_at: string;
  songs?: Song[];
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELED' | 'EXPIRED';

export interface OrderItem {
  id: string;
  order_id: string;
  package_id: string;
  package_title: string;
  package_cover?: string;
  price_at_purchase: number;
  total_tracks: number;
  total_size: number;
}

export interface Payment {
  id: string;
  order_id: string;
  method: 'PIX';
  pix_qr_code: string; // base64 or qr image data
  pix_copy_paste: string; // EMV BR Code
  tx_id: string;
  status: OrderStatus;
  paid_at?: string | null;
  expires_at: string;
  amount: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  total_amount: number;
  discount_amount: number;
  coupon_code?: string | null;
  status: OrderStatus;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface DownloadRecord {
  id: string;
  user_id: string;
  user_email?: string;
  order_id: string;
  package_id: string;
  package_title: string;
  song_id?: string | null;
  song_title?: string | null;
  ip_address?: string;
  downloaded_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  min_order_value?: number;
  max_uses?: number;
  uses_count: number;
  expires_at?: string | null;
  is_active: boolean;
  participating_packages?: string[]; // empty means all
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'PURCHASE' | 'SYSTEM' | 'PROMO' | 'PACKAGE';
  target_user_id?: string | null; // null means broadcast to all
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  details: string;
  ip?: string;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalSales: number;
  paidSalesCount: number;
  pendingSalesCount: number;
  totalRevenue: number;
  totalDownloads: number;
  bestsellers: Array<{
    id: string;
    title: string;
    cover_image: string;
    sales_count: number;
    revenue: number;
  }>;
  recentOrders: Order[];
  recentActivities: ActivityLog[];
}
