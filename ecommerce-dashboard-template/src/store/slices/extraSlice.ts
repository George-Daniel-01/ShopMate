import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ExtraState } from "../../types/index";

const initialState: ExtraState = {
  openedComponent: "Dashboard",
  isNavbarOpened: false,
  isViewProductModalOpened: false,
  isCreateProductModalOpened: false,
  isUpdateProductModalOpened: false,
};

const extraSlice = createSlice({
  name: "extra",
  initialState,
  reducers: {
    toggleComponent: (state, action: PayloadAction<string>) => {
      state.openedComponent = action.payload;
    },
    toggleNavbar: (state) => { state.isNavbarOpened = !state.isNavbarOpened; },
    toggleCreateProductModal: (state) => { state.isCreateProductModalOpened = !state.isCreateProductModalOpened; },
    toggleViewProductModal: (state) => { state.isViewProductModalOpened = !state.isViewProductModalOpened; },
    toggleUpdateProductModal: (state) => { state.isUpdateProductModalOpened = !state.isUpdateProductModalOpened; },
  },
});

export const { toggleComponent, toggleCreateProductModal, toggleNavbar, toggleUpdateProductModal, toggleViewProductModal } = extraSlice.actions;
export default extraSlice.reducer;
