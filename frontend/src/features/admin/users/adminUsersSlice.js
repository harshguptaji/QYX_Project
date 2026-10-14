import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getAdminUsersAPI } from "./adminUsersAPI";

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchAdminUsers",
  async (
    {
      page = 1,
      limit = 15,
      search = "",
      role = "all",
      verification = "all",
    } = {},
    { rejectWithValue, signal }
  ) => {
    try {
      return await getAdminUsersAPI({
        page,
        limit,
        search,
        role,
        verification,
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to load users."
      );
    }
  }
);

const initialState = {
  users: [],
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  },
  status: "idle",
  error: null,
  currentRequestId: null,
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,

  reducers: {
    resetAdminUsers: () => ({
      ...initialState,
      users: [],
      pagination: { ...initialState.pagination },
    }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
        state.users = [];
      })

      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        // Ignore responses from older searches or page requests.
        if (state.currentRequestId !== action.meta.requestId) return;

        const { users, pagination } = action.payload;

        state.status = "succeeded";
        state.users = users;
        state.pagination = {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: Math.max(
            1,
            Math.ceil(pagination.total / pagination.limit)
          ),
        };
        state.error = null;
        state.currentRequestId = null;
      })

      .addCase(fetchAdminUsers.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;

        state.currentRequestId = null;

        if (action.meta.aborted) {
          state.status = "idle";
          state.error = null;
          return;
        }

        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Unable to load users.";
      });
  },
});

export const { resetAdminUsers } = adminUsersSlice.actions;

export default adminUsersSlice.reducer;