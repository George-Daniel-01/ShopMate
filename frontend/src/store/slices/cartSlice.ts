import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, CartState, Product } from "../../types/index";

const cartSlice = createSlice({
  name: "cart",
  initialState: { cart: [] } as CartState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ product, quantity });
      }
    },
    removeFromCart(state, action: PayloadAction<string | { id: string }>) {
      const id = typeof action.payload === "string" ? action.payload : action.payload.id;
      state.cart = state.cart.filter((item) => item.product.id !== id);
    },
    updateCartQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.product.id === id);
      if (item) {
        const newQuantity = item.quantity + quantity;
        if (newQuantity > 0) item.quantity = newQuantity;
      }
    },
    clearCart(state) {
      state.cart = [];
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
