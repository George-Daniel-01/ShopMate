import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import popupReducer from "./popupSlice";
import cartReducer from "../features/cart/cartSlice";
import productReducer from "../features/products/productSlice";
import orderReducer from "../features/orders/orderSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    cart: cartReducer,
    product: productReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;






