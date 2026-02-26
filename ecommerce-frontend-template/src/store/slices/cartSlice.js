import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
  },
  reducers: {
    addToCart(state, action) {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.push({ product, quantity });
      }
    },

    removeFromCart(state, action) {
      const id = action.payload?.id || action.payload;
      state.cart = state.cart.filter((item) => item.product.id !== id);
    },

    updateCartQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.product.id === id);
      if (item) {
        const newQuantity = item.quantity + quantity;
        if (newQuantity > 0) {
          item.quantity = newQuantity;
        }
      }
    },

    clearCart(state) {
      state.cart = [];
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;