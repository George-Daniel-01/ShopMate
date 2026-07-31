import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Please provide your name"),
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Please provide your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be between 8 and 16 characters")
      .max(16, "Password must be between 8 and 16 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please provide your current password"),
    newPassword: z
      .string()
      .min(8, "Password must be between 8 and 16 characters")
      .max(16, "Password must be between 8 and 16 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100),
  email: z.string().email("Please provide a valid email address"),
});

export const makeAdminSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export const registerAdminSchema = z.object({
  name: z.string().min(1, "Please provide your name"),
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be between 8 and 16 characters")
    .max(16, "Password must be between 8 and 16 characters"),
  adminSecretKey: z.string().min(1, "Admin secret key is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Please provide a product name"),
  description: z.string().min(1, "Please provide a product description"),
  price: z.coerce.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Please provide a category"),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative number"),
  imageUrls: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5),
  comment: z.string().min(1, "Please provide a comment"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Please provide a category name"),
  imageUrl: z.string().optional(),
});

export const orderSchema = z.object({
  full_name: z.string().min(1, "Please provide the full name"),
  state: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  address: z.string().min(1),
  pincode: z.string().min(1),
  phone: z.string().min(1),
  orderedItems: z.union([z.string().min(1, "No items in cart"), z.array(z.any())]).optional(),
});

export const orderStatusSchema = z.object({
  status: z.string().min(1, "Provide a valid status for order"),
});
