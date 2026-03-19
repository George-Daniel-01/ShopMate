import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAIModal } from "./popupSlice";
import type { Product, Review, ProductState } from "../../types/index";
import type { AppDispatch } from "../store";

interface FetchProductsParams {
  availability?: string;
  price?: string;
  category?: string;
  ratings?: number | string;
  search?: string;
  page?: number;
}

export const fetchAllProducts = createAsyncThunk<
  { products: Product[]; newProducts: Product[]; topRatedProducts: Product[]; totalProducts: number },
  FetchProductsParams
>("product/fetchAll", async ({ availability = "", price = "0-10000", category = "", ratings = "", search = "", page = 1 }, thunkAPI) => {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (price) params.append("price", price);
    if (search) params.append("search", search);
    if (ratings) params.append("ratings", String(ratings));
    if (availability) params.append("availability", availability);
    if (page) params.append("page", String(page));
    const res = await axiosInstance.get(`/product?${params.toString()}`);
    return res.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch products.");
  }
});

export const fetchProductDetails = createAsyncThunk<Product, string>(
  "product/singleProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/singleProduct/${id}`);
      return res.data.product as Product;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch product details.");
    }
  }
);

export const postReview = createAsyncThunk<Review, { productId: string; review: FormData }>(
  "product/post-new/review",
  async ({ productId, review }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/product/post-new/review/${productId}`, review);
      toast.success(res.data.message);
      return res.data.review as Review;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post review.");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to post review.");
    }
  }
);

export const deleteReview = createAsyncThunk<string, { productId: string; reviewId: string }>(
  "product/delete/review",
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/product/delete/review/${productId}`);
      toast.success(res.data.message);
      return reviewId;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review.");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete review.");
    }
  }
);

export const fetchProductWithAI = createAsyncThunk<
  { products: Product[]; totalProducts: number },
  string
>("product/ai-search", async (userPrompt, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/product/ai-search", { userPrompt });
    (thunkAPI.dispatch as AppDispatch)(toggleAIModal());
    return res.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message);
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch AI Filtered products.");
  }
});

const initialState: ProductState = {
  products: [],
  newProducts: [],
  topRatedProducts: [],
  productDetails: null,
  productReviews: [],
  totalProducts: 0,
  loading: true,
  isPostingReview: false,
  isReviewDeleting: false,
  aiSearching: false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetProductDetails(state) {
      state.productDetails = null;
      state.productReviews = [];
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => { state.loading = false; })
      .addCase(fetchProductDetails.pending, (state) => { state.loading = true; state.productDetails = null; })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
        state.productReviews = action.payload?.reviews || [];
      })
      .addCase(fetchProductDetails.rejected, (state) => { state.loading = false; state.productDetails = null; })
      .addCase(postReview.pending, (state) => { state.isPostingReview = true; })
      .addCase(postReview.fulfilled, (state, action) => {
        state.isPostingReview = false;
        const newReview = action.payload;
        const existingIndex = state.productReviews.findIndex((r) => r.reviewer?.id === newReview.user_id);
        if (existingIndex !== -1) {
          state.productReviews[existingIndex].rating = Number(newReview.rating);
          state.productReviews[existingIndex].comment = newReview.comment;
        } else {
          state.productReviews = [{ ...newReview, reviewer: newReview.reviewer || { id: newReview.user_id ?? "", name: newReview.user_name || "Anonymous", avatar: newReview.user_avatar ? { url: newReview.user_avatar } : null } }, ...state.productReviews];
        }
      })
      .addCase(postReview.rejected, (state) => { state.isPostingReview = false; })
      .addCase(deleteReview.pending, (state) => { state.isReviewDeleting = true; })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isReviewDeleting = false;
        state.productReviews = state.productReviews.filter((r) => r.review_id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state) => { state.isReviewDeleting = false; })
      .addCase(fetchProductWithAI.pending, (state) => { state.aiSearching = true; })
      .addCase(fetchProductWithAI.fulfilled, (state, action) => {
        state.aiSearching = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.products.length;
      })
      .addCase(fetchProductWithAI.rejected, (state) => { state.aiSearching = false; });
  },
});

export const { resetProductDetails } = productSlice.actions;
export default productSlice.reducer;
