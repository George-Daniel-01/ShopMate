import { createSlice } from "@reduxjs/toolkit";
import type { PopupState, Product } from "../../types/index";

const initialState: PopupState = {
  isAuthPopupOpen: false,
  authPopupView: "login",
  isSidebarOpen: false,
  isSearchBarOpen: false,
  isCartOpen: false,
  isAIPopupOpen: false,
  quickViewProduct: null,
  pendingCheckout: false,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    toggleAuthPopup(state) {
      state.isAuthPopupOpen = !state.isAuthPopupOpen;
      if (state.isAuthPopupOpen && !state.authPopupView.startsWith("reset")) state.authPopupView = "login";
    },
    openAuthPopup(state) {
      state.isAuthPopupOpen = true;
      state.authPopupView = "login";
    },
    setPendingCheckout(state) {
      state.pendingCheckout = true;
    },
    clearPendingCheckout(state) {
      state.pendingCheckout = false;
    },
    setAuthPopupView(state, action) { state.authPopupView = action.payload; },
    toggleSidebar(state) { state.isSidebarOpen = !state.isSidebarOpen; },
    toggleSearchBar(state) { state.isSearchBarOpen = !state.isSearchBarOpen; },
    toggleCart(state) { state.isCartOpen = !state.isCartOpen; },
    toggleAIModal(state) { state.isAIPopupOpen = !state.isAIPopupOpen; },
    openQuickView(state, action: { payload: Product }) { state.quickViewProduct = action.payload; },
    closeQuickView(state) { state.quickViewProduct = null; },
  },
});

export const { toggleAuthPopup, openAuthPopup, setAuthPopupView, setPendingCheckout, clearPendingCheckout, toggleSidebar, toggleSearchBar, toggleCart, toggleAIModal, openQuickView, closeQuickView } = popupSlice.actions;
export default popupSlice.reducer;
