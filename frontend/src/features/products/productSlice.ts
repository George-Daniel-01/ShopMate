import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product, ProductState } from "../../types/index";

const initialState: ProductState = {
  isAISearchResult: false,
  aiProducts: [],
  aiTotalProducts: 0,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setAISearchPending(state) {
      state.isAISearchResult = false;
    },
    setAISearchResults(
      state,
      action: PayloadAction<{ products: Product[]; totalProducts: number }>
    ) {
      state.isAISearchResult = true;
      state.aiProducts = action.payload.products;
      state.aiTotalProducts = action.payload.totalProducts;
    },
    clearAISearchResult(state) {
      state.isAISearchResult = false;
    },
  },
});

export const { setAISearchPending, setAISearchResults, clearAISearchResult } =
  productSlice.actions;
export default productSlice.reducer;
