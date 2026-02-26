import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice";

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      // BUG FIX: Send JSON data instead of FormData if backend expects JSON
      const res = await axiosInstance.post("/auth/register", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success(res.data.message);
      thunkAPI.dispatch(toggleAuthPopup());
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success(res.data.message);
      thunkAPI.dispatch(toggleAuthPopup());
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get user."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.get("/auth/logout");
      // BUG FIX: Don't toggle popup on logout, just clear user
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to logout."
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      // BUG FIX: Send data as object with frontendUrl as query param
      const res = await axiosInstance.post(
        "/auth/password/forgot",
        data,
        {
          params: {
            frontendUrl: "http://localhost:5173",
          },
        }
      );
      toast.success(res.data.message);
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      thunkAPI.dispatch(toggleAuthPopup()); // Close popup after successful reset
      return res.data.user;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data, thunkAPI) => {
    try {
      // BUG FIX: Send as JSON, not FormData (based on your API)
      const res = await axiosInstance.put(`/auth/password/update`, data);
      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      // FormData is correct here for file upload
      const res = await axiosInstance.put(`/auth/profile/update`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: false,
    isRequestingForToken: false,
    isUpdatingPassword: false,
    isUpdatingProfile: false,
  },
  reducers: {}, // Add reducers here if needed
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(register.rejected, (state) => {
        state.isSigningUp = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      // Get User
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        state.authUser = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        // Optional: Add loading state
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        // Handle error if needed
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updatePassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.authUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export default authSlice.reducer;