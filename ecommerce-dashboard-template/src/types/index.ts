export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  id: string;
  name: string;
  title?: string;
  description: string;
  price: number;
  category: string;
  ratings: number;
  images: ProductImage[];
  stock: number;
  created_by: string;
  created_at: string;
  review_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin";
  avatar?: { url: string; public_id: string } | null;
  created_at: string;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  image: string;
  title: string;
}

export interface ShippingInfo {
  full_name: string;
  state: string;
  city: string;
  country: string;
  address: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_price: number;
  tax_price: number;
  shipping_price: number;
  order_status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paid_at: string | null;
  created_at: string;
  order_items: OrderItem[];
  shipping_info: ShippingInfo;
}

export interface TopSellingProduct {
  name: string;
  image: string;
  category: string;
  ratings: number;
  total_sold: number;
}

export interface MonthlySale {
  month: string;
  totalsales: number;
}

export interface OrderStatusCounts {
  Processing?: number;
  Shipped?: number;
  Delivered?: number;
  Cancelled?: number;
  [key: string]: number | undefined;
}

export interface AuthState {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

export interface AdminState {
  loading: boolean;
  users: User[];
  totalUsers: number;
  totalRevenueAllTime: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  totalUsersCount: number;
  monthlySales: MonthlySale[];
  orderStatusCounts: OrderStatusCounts;
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: number;
  revenueGrowth: string;
  newUsersThisMonth: number;
  currentMonthSales: number;
}

export interface ExtraState {
  openedComponent: string;
  isNavbarOpened: boolean;
  isViewProductModalOpened: boolean;
  isCreateProductModalOpened: boolean;
  isUpdateProductModalOpened: boolean;
}

export interface ProductState {
  loading: boolean;
  products: Product[];
  totalProducts: number;
}

export interface OrderState {
  loading: boolean;
  orders: Order[];
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  admin: AdminState;
  extra: ExtraState;
  product: ProductState;
  order: OrderState;
}
