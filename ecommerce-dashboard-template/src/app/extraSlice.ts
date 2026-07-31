import { createSlice } from "@reduxjs/toolkit";
import type { ExtraState } from "../types/index";

const initialState: ExtraState = {
  isNavbarOpened: false,
  isViewProductModalOpened: false,
  isCreateProductModalOpened: false,
  isUpdateProductModalOpened: false,
  isCreateCategoryModalOpened: false,
  isUpdateCategoryModalOpened: false,
};

const extraSlice = createSlice({
  name: "extra",
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      state.isNavbarOpened = !state.isNavbarOpened;
    },
    toggleCreateProductModal: (state) => {
      state.isCreateProductModalOpened = !state.isCreateProductModalOpened;
    },
    toggleViewProductModal: (state) => {
      state.isViewProductModalOpened = !state.isViewProductModalOpened;
    },
    toggleUpdateProductModal: (state) => {
      state.isUpdateProductModalOpened = !state.isUpdateProductModalOpened;
    },
    toggleCreateCategoryModal: (state) => {
      state.isCreateCategoryModalOpened = !state.isCreateCategoryModalOpened;
    },
    toggleUpdateCategoryModal: (state) => {
      state.isUpdateCategoryModalOpened = !state.isUpdateCategoryModalOpened;
    },
  },
});

export const {
  toggleNavbar,
  toggleCreateProductModal,
  toggleViewProductModal,
  toggleUpdateProductModal,
  toggleCreateCategoryModal,
  toggleUpdateCategoryModal,
} = extraSlice.actions;
export default extraSlice.reducer;
