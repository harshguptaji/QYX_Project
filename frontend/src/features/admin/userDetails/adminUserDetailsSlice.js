import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAdminUserDetailsAPI,
  updateAdminUserAPI,
} from "./adminUserDetailsAPI";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong.";

// Fetch one user's information.
export const fetchAdminUserDetails = createAsyncThunk(
  "adminUserDetails/fetchAdminUserDetails",
  async (userId, { rejectWithValue, signal }) => {
    try {
      return await getAdminUserDetailsAPI(userId, signal);
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Update one user's information.
export const updateAdminUser = createAsyncThunk(
  "adminUserDetails/updateAdminUser",
  async ({ userId, fields }, { rejectWithValue }) => {
    try {
      return await updateAdminUserAPI(userId, fields);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  user: null,
  requestedUserId: null,

  status: "idle",
  error: null,
  fetchRequestId: null,

  updateStatus: "idle",
  updateError: null,
  updateMessage: null,
  updateRequestId: null,
};

const adminUserDetailsSlice = createSlice({
  name: "adminUserDetails",
  initialState,

  reducers: {
    clearAdminUserUpdateFeedback: (state) => {
      state.updateError = null;
      state.updateMessage = null;
    },

    resetAdminUserDetails: () => ({
      ...initialState,
    }),
  },

  extraReducers: (builder) => {
    builder
      // Fetch user details
      .addCase(fetchAdminUserDetails.pending, (state, action) => {
        state.user = null;
        state.requestedUserId = action.meta.arg;

        state.status = "loading";
        state.error = null;
        state.fetchRequestId = action.meta.requestId;

        // Invalidate feedback and pending results for the previous user.
        state.updateStatus = "idle";
        state.updateError = null;
        state.updateMessage = null;
        state.updateRequestId = null;
      })

      .addCase(fetchAdminUserDetails.fulfilled, (state, action) => {
        if (
          state.fetchRequestId !== action.meta.requestId ||
          state.requestedUserId !== action.meta.arg
        ) {
          return;
        }

        state.user = action.payload.user;
        state.status = "succeeded";
        state.error = null;
        state.fetchRequestId = null;
      })

      .addCase(fetchAdminUserDetails.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) {
          return;
        }

        state.fetchRequestId = null;

        if (action.meta.aborted) {
          state.status = "idle";
          state.error = null;
          return;
        }

        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Unable to load user details.";
      })

      // Update user details
      .addCase(updateAdminUser.pending, (state, action) => {
        if (state.requestedUserId !== action.meta.arg.userId) {
          return;
        }

        state.updateStatus = "loading";
        state.updateError = null;
        state.updateMessage = null;
        state.updateRequestId = action.meta.requestId;
      })

      .addCase(updateAdminUser.fulfilled, (state, action) => {
        if (
          state.updateRequestId !== action.meta.requestId ||
          state.requestedUserId !== action.meta.arg.userId
        ) {
          return;
        }

        // Use the saved record returned by the backend.
        state.user = action.payload.user;

        state.updateStatus = "succeeded";
        state.updateError = null;
        state.updateMessage =
          action.payload.message || "User updated successfully.";

        state.updateRequestId = null;
      })

      .addCase(updateAdminUser.rejected, (state, action) => {
        if (
          state.updateRequestId !== action.meta.requestId ||
          state.requestedUserId !== action.meta.arg.userId
        ) {
          return;
        }

        state.updateRequestId = null;
        state.updateStatus = "failed";
        state.updateMessage = null;
        state.updateError =
          action.payload ||
          action.error.message ||
          "Unable to update user.";
      });
  },
});

export const {
  clearAdminUserUpdateFeedback,
  resetAdminUserDetails,
} = adminUserDetailsSlice.actions;

export default adminUserDetailsSlice.reducer;