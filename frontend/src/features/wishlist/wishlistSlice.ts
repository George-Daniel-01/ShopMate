import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import type { Product, WishlistState } from "../../types/index";

const STORAGE_KEY = "shopmate_wishlist";

const loadWishlist = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { wishlist: loadWishlist() } as WishlistState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const product = action.payload;
      const exists = state.wishlist.some((p) => p.id === product.id);
      if (exists) {
        state.wishlist = state.wishlist.filter((p) => p.id !== product.id);
        toast.info(`${product.name} removed from wishlist`);
      } else {
        state.wishlist = [{ ...product, images: product.images || [] }, ...state.wishlist];
        toast.success(`${product.name} added to wishlist`);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.wishlist));
      } catch {
        /* storage full — ignore */
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.wishlist = state.wishlist.filter((p) => p.id !== action.payload);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.wishlist));
      } catch {
        /* storage full — ignore */
      }
    },
    clearWishlist(state) {
      state.wishlist = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
