import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  forgotPasswordAPI,
  resetPasswordAPI,
} from "./authAPI";

const getError = (error) => ({
  message:
    error.response?.data?.message ||
    error.message ||
    "Something went wrong.",
  retryAfterSeconds:
    Number(error.response?.data?.retryAfterSeconds) || 0,
});

export const requestPasswordResetOtp = createAsyncThunk(
  "passwordReset/requestOtp",
  async (email, { rejectWithValue }) => {
    try {
      const userEmail = email.trim().toLowerCase();
      const response = await forgotPasswordAPI(userEmail);

      return {
        ...response,
        userEmail,
      };
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "passwordReset/resetPassword",
  async (fields, { rejectWithValue }) => {
    try {
      return await resetPasswordAPI({
        userEmail: fields.userEmail.trim().toLowerCase(),
        otp: fields.otp.trim(),
        newPassword: fields.newPassword,
      });
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

const initialState = {
  email: "",
  sendStatus: "idle",
  sendError: null,
  sendMessage: null,
  sendRequestId: null,

  resetStatus: "idle",
  resetError: null,
  resetMessage: null,
  resetRequestId: null,
};

const passwordResetSlice = createSlice({
  name: "passwordReset",
  initialState,

  reducers: {
    clearPasswordResetFeedback: (state) => {
      state.sendError = null;
      state.sendMessage = null;
      state.resetError = null;
      state.resetMessage = null;
    },

    resetPasswordResetState: () => ({ ...initialState }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(requestPasswordResetOtp.pending, (state, action) => {
        state.sendStatus = "loading";
        state.sendError = null;
        state.sendMessage = null;
        state.resetError = null;
        state.sendRequestId = action.meta.requestId;
      })

      .addCase(requestPasswordResetOtp.fulfilled, (state, action) => {
        if (state.sendRequestId !== action.meta.requestId) return;

        state.sendStatus = "succeeded";
        state.email = action.payload.userEmail;
        state.sendMessage = action.payload.message;
        state.sendRequestId = null;
      })

      .addCase(requestPasswordResetOtp.rejected, (state, action) => {
        if (state.sendRequestId !== action.meta.requestId) return;

        state.sendStatus = "failed";
        state.sendError =
          action.payload?.message ||
          action.error.message ||
          "Unable to send OTP.";

        state.sendRequestId = null;
      })

      .addCase(resetPassword.pending, (state, action) => {
        state.resetStatus = "loading";
        state.resetError = null;
        state.resetMessage = null;
        state.resetRequestId = action.meta.requestId;
      })

      .addCase(resetPassword.fulfilled, (state, action) => {
        if (state.resetRequestId !== action.meta.requestId) return;

        state.resetStatus = "succeeded";
        state.resetMessage =
          action.payload.message ||
          "Password reset successfully. Please log in again.";

        state.resetRequestId = null;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        if (state.resetRequestId !== action.meta.requestId) return;

        state.resetStatus = "failed";
        state.resetError =
          action.payload?.message ||
          action.error.message ||
          "Unable to reset password.";

        state.resetRequestId = null;
      });
  },
});

export const {
  clearPasswordResetFeedback,
  resetPasswordResetState,
} = passwordResetSlice.actions;

export default passwordResetSlice.reducer;