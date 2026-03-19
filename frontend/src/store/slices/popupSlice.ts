import { createSlice } from "@reduxjs/toolkit";
import type { PopupState } from "../../types/index";

const initialState: PopupState = {
  isAuthPopupOpen: false,
  isSidebarOpen: false,
  isSearchBarOpen: false,
  isCartOpen: false,
  isAIPopupOpen: false,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    toggleAuthPopup(state) { state.isAuthPopupOpen = !state.isAuthPopupOpen; },
    toggleSidebar(state) { state.isSidebarOpen = !state.isSidebarOpen; },
    toggleSearchBar(state) { state.isSearchBarOpen = !state.isSearchBarOpen; },
    toggleCart(state) { state.isCartOpen = !state.isCartOpen; },
    toggleAIModal(state) { state.isAIPopupOpen = !state.isAIPopupOpen; },
  },
});

export const { toggleAuthPopup, toggleSidebar, toggleSearchBar, toggleCart, toggleAIModal } = popupSlice.actions;
export default popupSlice.reducer;
