import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import type { AuthState, User } from "../../types/index";
import type { AppDispatch } from "../store";

const initialState: AuthState = { loading: false, user: null, isAuthenticated: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest(state) { state.loading = true; },
    loginSuccess(state, action: PayloadAction<User>) { state.loading = false; state.user = action.payload; state.isAuthenticated = true; },
    loginFailed(state) { state.loading = false; },
    getUserRequest(state) { state.loading = true; },
    getUserSuccess(state, action: PayloadAction<User>) { state.loading = false; state.user = action.payload; state.isAuthenticated = true; },
    getUserFailed(state) { state.loading = false; state.user = null; state.isAuthenticated = false; },
    logoutRequest(state) { state.loading = true; },
    logoutSuccess(state) { state.loading = false; state.user = null; state.isAuthenticated = false; },
    logoutFailed(state) { state.loading = false; },
    forgotPasswordRequest(state) { state.loading = true; },
    forgotPasswordSuccess(state) { state.loading = false; },
    forgotPasswordFailed(state) { state.loading = false; },
    resetPasswordRequest(state) { state.loading = true; },
    resetPasswordSuccess(state, action: PayloadAction<User>) { state.loading = false; state.isAuthenticated = true; state.user = action.payload; },
    resetPasswordFailed(state) { state.loading = false; },
    updateProfileRequest(state) { state.loading = true; },
    updateProfileSuccess(state, action: PayloadAction<User>) { state.loading = false; state.user = action.payload; },
    updateProfileFailed(state) { state.loading = false; },
    updatePasswordRequest(state) { state.loading = true; },
    updatePasswordSuccess(state) { state.loading = false; },
    updatePasswordFailed(state) { state.loading = false; },
    resetAuthSlice(state) { state.loading = false; },
  },
});

export const login = (data: FormData) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginRequest());
  try {
    const res = await axiosInstance.post("/auth/login", data);
    if (res.data.user.role === "Admin") {
      dispatch(authSlice.actions.loginSuccess(res.data.user));
      toast.success(res.data.message);
    } else {
      dispatch(authSlice.actions.loginFailed());
      toast.error("Access denied. Admins only.");
    }
  } catch (error: any) {
    dispatch(authSlice.actions.loginFailed());
    toast.error(error.response?.data?.message || "Login failed.");
  }
};

export const getUser = () => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.getUserRequest());
  try {
    const res = await axiosInstance.get("/auth/me");
    dispatch(authSlice.actions.getUserSuccess(res.data.user));
  } catch {
    dispatch(authSlice.actions.getUserFailed());
  }
};

export const logout = () => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.logoutRequest());
  try {
    const res = await axiosInstance.get("/auth/logout");
    dispatch(authSlice.actions.logoutSuccess());
    toast.success(res.data.message);
    dispatch(authSlice.actions.resetAuthSlice());
  } catch (error: any) {
    dispatch(authSlice.actions.logoutFailed());
    toast.error(error.response?.data?.message || "Logout failed.");
    dispatch(authSlice.actions.resetAuthSlice());
  }
};

export const forgotPassword = (email: { email: string }) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.forgotPasswordRequest());
  try {
    const res = await axiosInstance.post("/auth/password/forgot?frontendUrl=http://localhost:5174", email);
    dispatch(authSlice.actions.forgotPasswordSuccess());
    toast.success(res.data.message);
  } catch (error: any) {
    dispatch(authSlice.actions.forgotPasswordFailed());
    toast.error(error.response?.data?.message || "Cannot request for reset password.");
  }
};

export const resetPassword = (newData: FormData, token: string) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.resetPasswordRequest());
  try {
    const res = await axiosInstance.put(`/auth/password/reset/${token}`, newData);
    dispatch(authSlice.actions.resetPasswordSuccess(res.data.user));
    toast.success(res.data.message);
  } catch (error: any) {
    dispatch(authSlice.actions.resetPasswordFailed());
    toast.error(error.response?.data?.message || "Failed to reset password.");
  }
};

export const updateAdminProfile = (data: FormData) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.updateProfileRequest());
  try {
    const res = await axiosInstance.put("/auth/profile/update", data);
    dispatch(authSlice.actions.updateProfileSuccess(res.data.user));
    toast.success(res.data.message);
  } catch (error: any) {
    dispatch(authSlice.actions.updateProfileFailed());
    toast.error(error.response?.data?.message || "Failed to update profile.");
  }
};

export const updateAdminPassword = (data: FormData) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.updatePasswordRequest());
  try {
    const res = await axiosInstance.put("/auth/password/update", data);
    dispatch(authSlice.actions.updatePasswordSuccess());
    toast.success(res.data.message);
  } catch (error: any) {
    dispatch(authSlice.actions.updatePasswordFailed());
    toast.error(error.response?.data?.message || "Failed to update password.");
  }
};

export const resetAuthSlice = () => (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export default authSlice.reducer;
