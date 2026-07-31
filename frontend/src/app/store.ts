import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import popupReducer from "./popupSlice";
import cartReducer from "../features/cart/cartSlice";
import productReducer from "../features/products/productSlice";
import orderReducer from "../features/orders/orderSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    cart: cartReducer,
    product: productReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
