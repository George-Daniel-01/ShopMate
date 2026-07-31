import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import productReducer from "../features/products/productSlice";

describe("Redux Store", () => {
  it("creates store with auth reducer", () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });
    const state = store.getState();
    expect(state.auth).toBeDefined();
    expect(state.auth).toHaveProperty("isCheckingAuth");
  });

  it("creates store with cart reducer", () => {
    const store = configureStore({
      reducer: { cart: cartReducer },
    });
    const state = store.getState();
    expect(state.cart).toBeDefined();
    expect(state.cart).toHaveProperty("cart");
  });

  it("creates store with product reducer", () => {
    const store = configureStore({
      reducer: { product: productReducer },
    });
    const state = store.getState();
    expect(state.product).toBeDefined();
    expect(state.product).toHaveProperty("products");
  });
});