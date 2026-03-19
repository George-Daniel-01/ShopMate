import { Request } from "express";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "User" | "Admin";
  avatar: { public_id: string; url: string } | null;
  reset_password_token: string | null;
  reset_password_expire: Date | null;
  created_at: Date;
}

export interface IOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  image: string;
  title: string;
}

export interface IProductImage {
  url: string;
  public_id: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ratings: number;
  images: IProductImage[];
  stock: number;
  created_by: string;
  created_at: Date;
}

export interface ICartItem {
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: IProductImage[];
  };
}

export interface IPaymentResult {
  success: boolean;
  clientSecret?: string;
  message?: string;
}

export interface IAIResult {
  success: boolean;
  products?: IProduct[];
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}
