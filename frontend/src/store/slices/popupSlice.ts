import { createSlice } from "@reduxjs/toolkit";
import type { PopupState } from "../../types/index";

const initialState: PopupState = {
  isAuthPopupOpen: false,
  authPopupView: "login",
  isSidebarOpen: false,
  isSearchBarOpen: false,
  isCartOpen: false,
  isAIPopupOpen: false,
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
    },
    setAuthPopupView(state, action) { state.authPopupView = action.payload; },
    toggleSidebar(state) { state.isSidebarOpen = !state.isSidebarOpen; },
    toggleSearchBar(state) { state.isSearchBarOpen = !state.isSearchBarOpen; },
    toggleCart(state) { state.isCartOpen = !state.isCartOpen; },
    toggleAIModal(state) { state.isAIPopupOpen = !state.isAIPopupOpen; },
  },
});

export const { toggleAuthPopup, openAuthPopup, setAuthPopupView, toggleSidebar, toggleSearchBar, toggleCart, toggleAIModal } = popupSlice.actions;
export default popupSlice.reducer;
