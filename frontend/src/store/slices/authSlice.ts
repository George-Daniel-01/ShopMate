import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice";
import type { AuthState, User } from "../../types/index";
import type { AppDispatch } from "../store";

export const register = createAsyncThunk<User, FormData | Record<string, string>>(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/register", data, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      (thunkAPI.dispatch as AppDispatch)(toggleAuthPopup());
      return res.data.user as User;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const login = createAsyncThunk<User, Record<string, string>>(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      (thunkAPI.dispatch as AppDispatch)(toggleAuthPopup());
      localStorage.setItem("token", res.data.token);
      return res.data.user as User;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUser = createAsyncThunk<User>("auth/getUser", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user as User;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to get user.");
  }
});

export const logout = createAsyncThunk<null>("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/auth/logout");
    return null;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Logout failed");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to logout.");
  }
});

export const forgotPassword = createAsyncThunk<null, { email: string }>(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/password/forgot", data, {
        params: { frontendUrl: "http://localhost:5173" },
      });
      toast.success(res.data.message);
      return null;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resetPassword = createAsyncThunk<User, { token: string; password: string; confirmPassword: string }>(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/reset/${token}`, { password, confirmPassword });
      toast.success(res.data.message);
      (thunkAPI.dispatch as AppDispatch)(toggleAuthPopup());
      return res.data.user as User;
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk<null, Record<string, string>>(
  "auth/updatePassword",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/auth/password/update", data);
      toast.success(res.data.message);
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk<User, FormData>(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/auth/profile/update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      return res.data.user as User;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState: AuthState = {
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  isRequestingForToken: false,
  isUpdatingPassword: false,
  isUpdatingProfile: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isSigningUp = true; })
      .addCase(register.fulfilled, (state, action) => { state.isSigningUp = false; state.authUser = action.payload; })
      .addCase(register.rejected, (state) => { state.isSigningUp = false; })
      .addCase(login.pending, (state) => { state.isLoggingIn = true; })
      .addCase(login.fulfilled, (state, action) => { state.isLoggingIn = false; state.authUser = action.payload; })
      .addCase(login.rejected, (state) => { state.isLoggingIn = false; })
      .addCase(getUser.pending, (state) => { state.isCheckingAuth = true; state.authUser = null; })
      .addCase(getUser.fulfilled, (state, action) => { state.isCheckingAuth = false; state.authUser = action.payload; })
      .addCase(getUser.rejected, (state) => { state.isCheckingAuth = false; state.authUser = null; })
      .addCase(logout.fulfilled, (state) => { state.authUser = null; })
      .addCase(forgotPassword.pending, (state) => { state.isRequestingForToken = true; })
      .addCase(forgotPassword.fulfilled, (state) => { state.isRequestingForToken = false; })
      .addCase(forgotPassword.rejected, (state) => { state.isRequestingForToken = false; })
      .addCase(resetPassword.pending, (state) => { state.isUpdatingPassword = true; })
      .addCase(resetPassword.fulfilled, (state, action) => { state.isUpdatingPassword = false; state.authUser = action.payload; })
      .addCase(resetPassword.rejected, (state) => { state.isUpdatingPassword = false; })
      .addCase(updatePassword.pending, (state) => { state.isUpdatingPassword = true; })
      .addCase(updatePassword.fulfilled, (state) => { state.isUpdatingPassword = false; })
      .addCase(updatePassword.rejected, (state) => { state.isUpdatingPassword = false; })
      .addCase(updateProfile.pending, (state) => { state.isUpdatingProfile = true; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.isUpdatingProfile = false; state.authUser = action.payload; })
      .addCase(updateProfile.rejected, (state) => { state.isUpdatingProfile = false; });
  },
});

export default authSlice.reducer;
