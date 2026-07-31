import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import type { CartItem, CartState, Product } from "../../types/index";

const STORAGE_KEY = "shopmate_cart";

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* storage full — ignore */
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { cart: loadCart() } as CartState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ product, quantity });
      }
      saveCart(state.cart);
      toast.success(`${product.name} added to cart`);
    },
    removeFromCart(state, action: PayloadAction<string | { id: string }>) {
      const id = typeof action.payload === "string" ? action.payload : action.payload.id;
      const item = state.cart.find((item) => item.product.id === id);
      state.cart = state.cart.filter((item) => item.product.id !== id);
      saveCart(state.cart);
      if (item) toast.info(`${item.product.name} removed from cart`);
    },
    updateCartQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.product.id === id);
      if (item) {
        const newQuantity = item.quantity + quantity;
        if (newQuantity > 0) {
          item.quantity = newQuantity;
        } else {
          state.cart = state.cart.filter((i) => i.product.id !== id);
        }
        saveCart(state.cart);
      }
    },
    clearCart(state) {
      state.cart = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
