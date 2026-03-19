import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { toggleCreateProductModal, toggleUpdateProductModal } from "./extraSlice";
import type { Product, ProductState } from "../../types/index";
import type { AppDispatch } from "../store";

const axiosInstance = axios.create({ baseURL: "http://localhost:4000/api/v1", withCredentials: true });

const initialState: ProductState = { loading: false, products: [], totalProducts: 0 };

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    createProductRequest(state) { state.loading = true; },
    createProductSuccess(state, action: PayloadAction<Product>) { state.loading = false; state.products = [action.payload, ...state.products]; },
    createProductFailed(state) { state.loading = false; },
    getAllProductsRequest(state) { state.loading = true; },
    getAllProductsSuccess(state, action: PayloadAction<{ products: Product[]; totalProducts: number }>) {
      state.loading = false; state.products = action.payload.products; state.totalProducts = action.payload.totalProducts;
    },
    getAllProductsFailed(state) { state.loading = false; },
    updateProductRequest(state) { state.loading = true; },
    updateProductSuccess(state, action: PayloadAction<Product>) {
      state.loading = false;
      state.products = state.products.map((p) => p.id === action.payload.id ? action.payload : p);
    },
    updateProductFailed(state) { state.loading = false; },
    deleteProductRequest(state) { state.loading = true; },
    deleteProductSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.products = state.products.filter((p) => p.id !== action.payload);
      state.totalProducts = Math.max(0, state.totalProducts - 1);
    },
    deleteProductFailed(state) { state.loading = false; },
  },
});

export const createNewProduct = (data: FormData) => async (dispatch: AppDispatch) => {
  dispatch(productSlice.actions.createProductRequest());
  await axiosInstance.post("/product/admin/create", data)
    .then((res) => { dispatch(productSlice.actions.createProductSuccess(res.data.product)); toast.success(res.data.message || "Product created successfully."); dispatch(toggleCreateProductModal()); })
    .catch((error: any) => { dispatch(productSlice.actions.createProductFailed()); toast.error(error.response?.data?.message || "Failed to create product."); });
};

export const fetchAllProducts = (page?: number) => async (dispatch: AppDispatch) => {
  dispatch(productSlice.actions.getAllProductsRequest());
  await axiosInstance.get(`/product?page=${page || 1}`)
    .then((res) => dispatch(productSlice.actions.getAllProductsSuccess(res.data)))
    .catch(() => dispatch(productSlice.actions.getAllProductsFailed()));
};

export const updateProduct = (data: FormData | Record<string, string>, id: string) => async (dispatch: AppDispatch) => {
  dispatch(productSlice.actions.updateProductRequest());
  await axiosInstance.put(`/product/admin/update/${id}`, data)
    .then((res) => { dispatch(productSlice.actions.updateProductSuccess(res.data.updatedProduct)); toast.success(res.data.message || "Product updated successfully."); dispatch(toggleUpdateProductModal()); })
    .catch((error: any) => { dispatch(productSlice.actions.updateProductFailed()); toast.error(error.response?.data?.message || "Failed to update product."); });
};

export const deleteProduct = (id: string, page: number) => async (dispatch: AppDispatch, getState: () => any) => {
  dispatch(productSlice.actions.deleteProductRequest());
  await axiosInstance.delete(`/product/admin/delete/${id}`)
    .then((res) => {
      dispatch(productSlice.actions.deleteProductSuccess(id));
      toast.success(res.data.message || "Product deleted successfully.");
      const state = getState();
      const updatedTotal = state.product.totalProducts;
      const updatedMaxPage = Math.ceil(updatedTotal / 10) || 1;
      const validPage = Math.min(page, updatedMaxPage);
      dispatch(fetchAllProducts(validPage));
    })
    .catch((error: any) => { dispatch(productSlice.actions.deleteProductFailed()); toast.error(error.response?.data?.message || "Failed to delete product."); });
};

export default productSlice.reducer;
