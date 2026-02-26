import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      // ✅ FIX 3: Was "/orders/me" — must match backend route "/order/orders/me"
      // The backend mounts orderRouter at /api/v1/order, so the full path is
      // /api/v1/order/orders/me  →  axiosInstance baseURL has /api/v1, so use /order/orders/me
      const res = await axiosInstance.get("/order/orders/me");
      return res.data.myOrders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "order/placeOrder",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/new", data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to place order, try again."
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false,
    finalPrice: null,
    orderStep: 1,
    paymentIntent: null,
  },
  reducers: {
    toggleOrderStep(state) {
      state.orderStep = state.orderStep === 1 ? 2 : 1;
    },
    resetOrderState(state) {
      state.orderStep = 1;
      state.finalPrice = null;
      state.paymentIntent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.fetchingOrders = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.fetchingOrders = false;
      })
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.finalPrice = action.payload.total_price;
        state.paymentIntent = action.payload.paymentIntent;
        state.orderStep = 2;
      })
      .addCase(placeOrder.rejected, (state) => {
        state.placingOrder = false;
      });
  },
});

export default orderSlice.reducer;
export const { toggleOrderStep, resetOrderState } = orderSlice.actions;
