import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { toggleCreateCategoryModal, toggleUpdateCategoryModal } from "./extraSlice";
import type { Category, CategoryState } from "../../types/index";
import type { AppDispatch } from "../store";

const initialState: CategoryState = {
  loading: false,
  actionLoading: false,
  categories: [],
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    createCategoryRequest(state) {
      state.actionLoading = true;
    },
    createCategorySuccess(state, action: PayloadAction<Category>) {
      state.actionLoading = false;
      state.categories = [action.payload, ...state.categories];
    },
    createCategoryFailed(state) {
      state.actionLoading = false;
    },

    getAllCategoriesRequest(state) {
      state.loading = true;
    },
    getAllCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.loading = false;
      state.categories = action.payload;
    },
    getAllCategoriesFailed(state) {
      state.loading = false;
    },

    updateCategoryRequest(state) {
      state.actionLoading = true;
    },
    updateCategorySuccess(state, action: PayloadAction<Category>) {
      state.actionLoading = false;
      state.categories = state.categories.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
    },
    updateCategoryFailed(state) {
      state.actionLoading = false;
    },

    deleteCategoryRequest(state) {
      state.actionLoading = true;
    },
    deleteCategorySuccess(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    deleteCategoryFailed(state) {
      state.actionLoading = false;
    },
  },
});

// -- Thunks -------------------------------------------------------------------

export const createCategory =
  (data: FormData) => async (dispatch: AppDispatch) => {
    dispatch(categorySlice.actions.createCategoryRequest());
    await axiosInstance
      .post("/category/admin/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        dispatch(categorySlice.actions.createCategorySuccess(res.data.category));
        toast.success(res.data.message || "Category created successfully.");
        dispatch(toggleCreateCategoryModal());
      })
      .catch((error: any) => {
        dispatch(categorySlice.actions.createCategoryFailed());
        toast.error(error.response?.data?.message || "Failed to create category.");
      });
  };

export const fetchCategories = () => async (dispatch: AppDispatch) => {
  dispatch(categorySlice.actions.getAllCategoriesRequest());
  await axiosInstance
    .get("/category")
    .then((res) =>
      dispatch(categorySlice.actions.getAllCategoriesSuccess(res.data.categories ?? []))
    )
    .catch(() => dispatch(categorySlice.actions.getAllCategoriesFailed()));
};

export const updateCategory =
  (data: FormData | Record<string, string>, id: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(categorySlice.actions.updateCategoryRequest());
    await axiosInstance
      .put(`/category/admin/update/${id}`, data, {
        headers: {
          "Content-Type":
            data instanceof FormData ? "multipart/form-data" : "application/json",
        },
      })
      .then((res) => {
        dispatch(
          categorySlice.actions.updateCategorySuccess(res.data.category)
        );
        toast.success(res.data.message || "Category updated successfully.");
        dispatch(toggleUpdateCategoryModal());
      })
      .catch((error: any) => {
        dispatch(categorySlice.actions.updateCategoryFailed());
        toast.error(error.response?.data?.message || "Failed to update category.");
      });
  };

export const deleteCategory = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(categorySlice.actions.deleteCategoryRequest());
  await axiosInstance
    .delete(`/category/admin/delete/${id}`)
    .then((res) => {
      dispatch(categorySlice.actions.deleteCategorySuccess(id));
      toast.success(res.data.message || "Category deleted successfully.");
    })
    .catch((error: any) => {
      dispatch(categorySlice.actions.deleteCategoryFailed());
      toast.error(error.response?.data?.message || "Failed to delete category.");
    });
};

export default categorySlice.reducer;
