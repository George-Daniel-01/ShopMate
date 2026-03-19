export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ratings: number;
  images: ProductImage[];
  stock: number;
  created_by: string;
  created_at: string;
  review_count?: number;
  reviews?: Review[];
}

export interface Review {
  review_id: string;
  rating: number;
  comment: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string | null;
  reviewer?: {
    id: string;
    name: string;
    avatar?: { url: string } | null;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin";
  avatar?: { url: string; public_id: string } | null;
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

export interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  isRequestingForToken: boolean;
  isUpdatingPassword: boolean;
  isUpdatingProfile: boolean;
}

export interface CartState {
  cart: CartItem[];
}

export interface PopupState {
  isAuthPopupOpen: boolean;
  isSidebarOpen: boolean;
  isSearchBarOpen: boolean;
  isCartOpen: boolean;
  isAIPopupOpen: boolean;
}

export interface ProductState {
  products: Product[];
  newProducts: Product[];
  topRatedProducts: Product[];
  productDetails: Product | null;
  productReviews: Review[];
  totalProducts: number;
  loading: boolean;
  isPostingReview: boolean;
  isReviewDeleting: boolean;
  aiSearching: boolean;
}

export interface OrderState {
  myOrders: Order[];
  fetchingOrders: boolean;
  placingOrder: boolean;
  finalPrice: number | null;
  orderStep: number;
  paymentIntent: string | null;
}

export interface RootState {
  auth: AuthState;
  popup: PopupState;
  cart: CartState;
  product: ProductState;
  order: OrderState;
}
