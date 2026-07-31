import { configureStore } from "@reduxjs/toolkit";
import extraReducer from "./extraSlice";
import authReducer from "../features/auth/authSlice";
import adminReducer from "../features/dashboard/adminSlice";
import productReducer from "../features/products/productsSlice";
import categoryReducer from "../features/categories/categorySlice";
import orderReducer from "../features/orders/orderSlice";

export const store = configureStore({
  reducer: {
    extra: extraReducer,
    auth: authReducer,
    admin: adminReducer,
    product: productReducer,
    category: categoryReducer,
    order: orderReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
