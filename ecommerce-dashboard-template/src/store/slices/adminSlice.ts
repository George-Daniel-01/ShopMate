import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import type { AdminState, User } from "../../types/index";
import type { AppDispatch } from "../store";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:4000/api/v1" : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const initialState: AdminState = {
  loading: false, users: [], totalUsers: 0, totalRevenueAllTime: 0,
  todayRevenue: 0, yesterdayRevenue: 0, totalUsersCount: 0,
  monthlySales: [], orderStatusCounts: {}, topSellingProducts: [],
  lowStockProducts: 0, revenueGrowth: "0%", newUsersThisMonth: 0, currentMonthSales: 0,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    getAllUsersRequest(state) { state.loading = true; },
    getAllUsersSuccess(state, action: PayloadAction<{ users: User[]; totalUsers: number }>) {
      state.loading = false; state.users = action.payload.users; state.totalUsers = action.payload.totalUsers;
    },
    getAllUsersFailed(state) { state.loading = false; },
    deleteUserRequest(state) { state.loading = true; },
    deleteUserSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.totalUsers = Math.max(0, state.totalUsers - 1);
      state.totalUsersCount = Math.max(0, state.totalUsersCount - 1);
    },
    deleteUserFailed(state) { state.loading = false; },
    getStatsRequest(state) { state.loading = true; },
    getStatsSuccess(state, action: PayloadAction<Partial<AdminState>>) {
      state.loading = false;
      state.totalRevenueAllTime = action.payload.totalRevenueAllTime ?? 0;
      state.todayRevenue = action.payload.todayRevenue ?? 0;
      state.yesterdayRevenue = action.payload.yesterdayRevenue ?? 0;
      state.totalUsersCount = action.payload.totalUsersCount ?? 0;
      state.monthlySales = action.payload.monthlySales ?? [];
      state.orderStatusCounts = action.payload.orderStatusCounts ?? {};
      state.topSellingProducts = action.payload.topSellingProducts ?? [];
      state.lowStockProducts = (action.payload as any).lowStockProducts?.length ?? 0;
      state.revenueGrowth = action.payload.revenueGrowth ?? "0%";
      state.newUsersThisMonth = action.payload.newUsersThisMonth ?? 0;
      state.currentMonthSales = action.payload.currentMonthSales ?? 0;
    },
    getStatsFailed(state) { state.loading = false; },
  },
});

export const fetchAllUsers = (page?: number) => async (dispatch: AppDispatch) => {
  dispatch(adminSlice.actions.getAllUsersRequest());
  await axiosInstance.get(`/admin/getallusers?page=${page || 1}`)
    .then((res) => dispatch(adminSlice.actions.getAllUsersSuccess(res.data)))
    .catch(() => dispatch(adminSlice.actions.getAllUsersFailed()));
};

export const deleteUser = (id: string, page: number) => async (dispatch: AppDispatch, getState: () => any) => {
  dispatch(adminSlice.actions.deleteUserRequest());
  await axiosInstance.delete(`/admin/delete/${id}`)
    .then((res) => {
      dispatch(adminSlice.actions.deleteUserSuccess(id));
      toast.success(res.data.message || "User deleted successfully");
      const state = getState();
      const updatedTotal = state.admin.totalUsers;
      const updatedMaxPage = Math.ceil(updatedTotal / 10) || 1;
      const validPage = Math.min(page, updatedMaxPage);
      dispatch(fetchAllUsers(validPage));
    })
    .catch((error: any) => {
      dispatch(adminSlice.actions.deleteUserFailed());
      toast.error(error.response?.data?.message || "Failed to delete user.");
    });
};

export const getDashboardStats = () => async (dispatch: AppDispatch) => {
  dispatch(adminSlice.actions.getStatsRequest());
  await axiosInstance.get(`/admin/fetch/dashboard-stats`)
    .then((res) => dispatch(adminSlice.actions.getStatsSuccess(res.data)))
    .catch(() => dispatch(adminSlice.actions.getStatsFailed()));
};

export default adminSlice.reducer;
