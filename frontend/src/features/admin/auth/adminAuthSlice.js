import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  adminLoginAPI,
  getCurrentAdminAPI,
  adminLogoutAPI,
} from "./adminAuthAPI";

const getError = (error) => ({
  message:
    error.response?.data?.message ||
    error.message ||
    "Something went wrong.",
  status: error.response?.status || null,
});

export const loginAdmin = createAsyncThunk(
  "adminAuth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await adminLoginAPI(credentials);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

export const getCurrentAdmin = createAsyncThunk(
  "adminAuth/me",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getCurrentAdminAPI(signal);
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getError(error));
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await adminLogoutAPI();
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

const initialState = {
  admin: null,
  isAuthenticated: false,
  isAuthChecked: false,

  loginStatus: "idle",
  loginError: null,

  sessionStatus: "idle",
  sessionError: null,

  logoutStatus: "idle",
  logoutError: null,

  // Identifies the latest session-changing operation.
  currentRequestId: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,

  reducers: {
    clearAdminAuthFeedback: (state) => {
      state.loginError = null;
      state.logoutError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.loginStatus = "loading";
        state.loginError = null;
        state.sessionStatus = "idle";
        state.sessionError = null;
        state.logoutStatus = "idle";
      })

      .addCase(loginAdmin.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.admin = action.payload.admin;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.loginStatus = "succeeded";
        state.currentRequestId = null;
      })

      .addCase(loginAdmin.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.loginStatus = "failed";
        state.loginError =
          action.payload?.message || "Unable to sign in.";
        state.currentRequestId = null;
      })

      .addCase(getCurrentAdmin.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.sessionStatus = "loading";
        state.sessionError = null;
        state.loginStatus = "idle";
        state.logoutStatus = "idle";
      })

      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.admin = action.payload.admin;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.sessionStatus = "succeeded";
        state.currentRequestId = null;
      })

      .addCase(getCurrentAdmin.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.currentRequestId = null;

        if (action.meta.aborted) {
          state.sessionStatus = "idle";
          return;
        }

        state.isAuthChecked = true;
        state.sessionStatus = "failed";

        if (action.payload?.status === 401) {
          state.admin = null;
          state.isAuthenticated = false;
          state.sessionError = null;
        } else {
          state.sessionError =
            action.payload?.message || "Unable to check admin session.";
        }
      })

      .addCase(logoutAdmin.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.logoutStatus = "loading";
        state.logoutError = null;
        state.loginStatus = "idle";
        state.sessionStatus = "idle";
      })

      .addCase(logoutAdmin.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        return {
          ...initialState,
          isAuthChecked: true,
          logoutStatus: "succeeded",
        };
      })

      .addCase(logoutAdmin.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.logoutStatus = "failed";
        state.logoutError =
          action.payload?.message || "Unable to log out.";
        state.currentRequestId = null;
      });
  },
});

export const { clearAdminAuthFeedback } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;