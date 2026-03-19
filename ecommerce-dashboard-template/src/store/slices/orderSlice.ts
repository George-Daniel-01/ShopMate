import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import type { Order, OrderState } from "../../types/index";

const axiosInstance = axios.create({ baseURL: "http://localhost:4000/api/v1", withCredentials: true });

export const fetchAllOrders = createAsyncThunk<Order[]>("orders/fetchAll", async (_, thunkAPI) => {
  try {
    const { data } = await axiosInstance.get("/order/admin/getall");
    return data.orders as Order[];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
  }
});

export const updateOrderStatus = createAsyncThunk<Order, { orderId: string; status: string }>(
  "orders/updateStatus",
  async ({ orderId, status }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/order/admin/update/${orderId}`, { status });
      toast.success(data.message || "Order status updated successfully");
      return data.updatedOrder as Order;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update order status.");
    }
  }
);

export const deleteOrder = createAsyncThunk<string, string>("orders/delete", async (orderId, thunkAPI) => {
  try {
    const { data } = await axiosInstance.delete(`/order/admin/delete/${orderId}`);
    toast.success(data.message || "Order deleted successfully.");
    return orderId;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete order.");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const initialState: OrderState = { loading: false, orders: [], error: null };

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(updateOrderStatus.pending, (state) => { state.loading = true; })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) state.orders[index] = { ...state.orders[index], ...action.payload };
      })
      .addCase(updateOrderStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteOrder.pending, (state) => { state.loading = true; })
      .addCase(deleteOrder.fulfilled, (state, action) => { state.loading = false; state.orders = state.orders.filter((o) => o.id !== action.payload); })
      .addCase(deleteOrder.rejected, (state) => { state.loading = false; });
  },
});

export default orderSlice.reducer;
