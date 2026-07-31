import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { Method } from "axios";
import { axiosInstance } from "@/lib/axios";
import { toast } from "react-toastify";
import { setPlacementResult } from "@/features/orders/orderSlice";
import type { Order, Product, Review } from "@/types";

export interface FetchProductsParams {
  availability?: string;
  price?: string;
  category?: string;
  ratings?: number | string;
  search?: string;
  page?: number;
}

export interface ProductsResult {
  products: Product[];
  newProducts: Product[];
  topRatedProducts: Product[];
  totalProducts: number;
}

interface AxiosQueryArgs {
  url: string;
  method?: Method;
  data?: unknown;
  params?: object;
}

interface AxiosQueryError {
  status?: number;
  message: string;
}

/**
 * Wraps the shared axios instance so RTK Query keeps the existing
 * auth interceptors, withCredentials, and FormData handling intact.
 */
const axiosBaseQuery: BaseQueryFn<AxiosQueryArgs, any, AxiosQueryError> = async ({
  url,
  method = "get",
  data,
  params,
}) => {
  try {
    const result = await axiosInstance({ url, method, data, params });
    return { data: result.data };
  } catch (error: any) {
    return {
      error: {
        status: error.response?.status,
        message: error.response?.data?.message || "Something went wrong.",
      },
    };
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["ProductList", "ProductDetails", "Orders"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResult, FetchProductsParams>({
      query: (params) => ({ url: "/product", method: "get", params }),
      providesTags: ["ProductList"],
    }),
    getProductDetails: builder.query<Product, string>({
      query: (id) => ({ url: `/product/singleProduct/${id}`, method: "get" }),
      transformResponse: (response: { product: Product }) => response.product,
      providesTags: (_result, _error, id) => [{ type: "ProductDetails" as const, id }],
    }),
    postReview: builder.mutation<
      { message: string; review: Review },
      { productId: string; review: FormData }
    >({
      query: ({ productId, review }) => ({
        url: `/product/post-new/review/${productId}`,
        method: "put",
        data: review,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message);
        } catch (error: any) {
          toast.error(error?.error?.message || error?.message || "Failed to post review.");
        }
      },
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "ProductDetails" as const, id: productId },
        "ProductList",
      ],
    }),
    deleteReview: builder.mutation<
      { message: string },
      { productId: string; reviewId: string }
    >({
      query: ({ productId, reviewId }) => ({
        url: `/product/delete/review/${productId}`,
        method: "delete",
        params: { reviewId },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message);
        } catch (error: any) {
          toast.error(error?.error?.message || error?.message || "Failed to delete review.");
        }
      },
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "ProductDetails" as const, id: productId },
        "ProductList",
      ],
    }),
    aiSearch: builder.mutation<
      { products: Product[]; totalProducts: number },
      string
    >({
      async queryFn(userPrompt, _api, _extra, baseQuery) {
        const aiResult = await baseQuery({
          url: "/product/ai-search",
          method: "post",
          data: { userPrompt },
        });
        if (!aiResult.error) {
          return { data: aiResult.data };
        }
        // Fallback: regular text search so AI search still works if the model is down
        try {
          const fallback = await baseQuery({
            url: "/product",
            method: "get",
            params: { search: userPrompt, limit: 50 },
          });
          if (fallback.error) throw fallback.error;
          return {
            data: {
              products: fallback.data.products,
              totalProducts: fallback.data.totalProducts,
            },
          };
        } catch (error: any) {
          toast.error(error?.message || "AI search failed. Try again.");
          return {
            error: {
              status: 400,
              message: error?.message || "AI search failed. Try again.",
            },
          };
        }
      },
    }),
    getMyOrders: builder.query<Order[], void>({
      query: () => ({ url: "/order/orders/me", method: "get" }),
      transformResponse: (response: { myOrders: Order[] }) => response.myOrders,
      providesTags: ["Orders"],
    }),
    cancelOrder: builder.mutation<
      { message: string; updatedOrder: Order },
      string
    >({
      query: (orderId) => ({ url: `/order/cancel/${orderId}`, method: "put" }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message);
        } catch (error: any) {
          toast.error(error?.error?.message || error?.message || "Failed to cancel order.");
        }
      },
      invalidatesTags: ["Orders"],
    }),
    placeOrder: builder.mutation<
      { message: string; total_price: number; paymentIntent: string; orderId: string },
      FormData
    >({
      query: (data) => ({ url: "/order/new", method: "post", data }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message);
          dispatch(
            setPlacementResult({
              total_price: data.total_price,
              paymentIntent: data.paymentIntent,
            })
          );
        } catch (error: any) {
          toast.error(error?.error?.message || error?.message || "Failed to place order, try again.");
        }
      },
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  usePostReviewMutation,
  useDeleteReviewMutation,
  useAiSearchMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
  usePlaceOrderMutation,
} = apiSlice;
