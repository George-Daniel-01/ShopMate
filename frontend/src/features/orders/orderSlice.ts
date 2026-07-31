import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { OrderState } from "../../types/index";

const initialState: OrderState = {
  finalPrice: null,
  orderStep: 1,
  paymentIntent: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    toggleOrderStep(state) {
      state.orderStep = state.orderStep === 1 ? 2 : 1;
    },
    resetOrderState(state) {
      state.orderStep = 1;
      state.finalPrice = null;
      state.paymentIntent = null;
    },
    setPlacementResult(
      state,
      action: PayloadAction<{ total_price: number; paymentIntent: string }>
    ) {
      state.finalPrice = action.payload.total_price;
      state.paymentIntent = action.payload.paymentIntent;
      state.orderStep = 2;
    },
  },
});

export const { toggleOrderStep, resetOrderState, setPlacementResult } =
  orderSlice.actions;
export default orderSlice.reducer;
