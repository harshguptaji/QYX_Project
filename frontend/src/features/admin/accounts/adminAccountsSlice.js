import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  registerAdminAPI,
  getAllAdminsAPI,
  getAdminDetailsAPI,
  editAdminAPI,
  deleteAdminAPI,
} from "./adminAccountsAPI";

import { logoutAdmin } from "../auth/adminAuthSlice";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong.";

// Explicit fields prevent passwords from entering account state.
const normalizeAdmin = (admin) => ({
  _id: admin._id || admin.id,
  adminName: admin.adminName || "",
  adminEmail: admin.adminEmail || "",
  adminMobile: admin.adminMobile || "",
  adminRole: admin.adminRole || "",
  createdAt: admin.createdAt ?? null,
  updatedAt: admin.updatedAt ?? null,
});

// Backend list, filters and pagination
export const fetchAllAdmins = createAsyncThunk(
  "adminAccounts/fetchAll",
  async (filters = {}, { rejectWithValue, signal }) => {
    try {
      const response = await getAllAdminsAPI({
        ...filters,
        signal,
      });

      return {
        ...response,
        admins: response.admins.map(normalizeAdmin),
      };
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// View admin
export const fetchAdminDetails = createAsyncThunk(
  "adminAccounts/fetchDetails",
  async (adminId, { rejectWithValue, signal }) => {
    try {
      const response = await getAdminDetailsAPI(adminId, signal);

      return {
        ...response,
        admin: normalizeAdmin(response.admin),
      };
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Edit admin
export const editAdminAccount = createAsyncThunk(
  "adminAccounts/edit",
  async ({ adminId, fields }, { rejectWithValue }) => {
    try {
      const response = await editAdminAPI(adminId, fields);

      return {
        ...response,
        admin: normalizeAdmin(response.admin),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: ({ adminId }, { getState }) => {
      const state = getState().adminAccounts;

      return (
        state.editStatus !== "loading" &&
        state.deleteRequests[adminId]?.status !== "loading"
      );
    },
  },
);

// Delete admin
export const deleteAdminAccount = createAsyncThunk(
  "adminAccounts/delete",
  async (adminId, { rejectWithValue }) => {
    try {
      return await deleteAdminAPI(adminId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (adminId, { getState }) => {
      const state = getState().adminAccounts;

      return (
        state.deleteRequests[adminId]?.status !== "loading" &&
        !(state.editStatus === "loading" && state.editingAdminId === adminId)
      );
    },
  },
);

export const registerAdminAccount = createAsyncThunk(
  "adminAccounts/register",
  async (fields, { rejectWithValue }) => {
    try {
      const response = await registerAdminAPI(fields);

      return {
        message: response.message,
        admin: normalizeAdmin(response.admin),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().adminAccounts.registerStatus !== "loading",
  },
);

const createInitialState = () => ({
  // Directory
  admins: [],
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  listStatus: "idle",
  listError: null,
  listRequestId: null,
  listNeedsRefresh: false,

  // Details
  admin: null,
  requestedAdminId: null,
  detailsStatus: "idle",
  detailsError: null,
  detailsRequestId: null,

  // Edit
  editingAdminId: null,
  editStatus: "idle",
  editError: null,
  editMessage: null,
  editRequestId: null,

  // Registration
  registerStatus: "idle",
  registerError: null,
  registerMessage: null,
  registeredAdmin: null,
  registerRequestId: null,

  // Delete requests tracked per admin
  deleteRequests: {},

  // Prevent older list responses from overriding saved changes.
  revision: 0,
  listRequestRevision: null,
});

const adminAccountsSlice = createSlice({
  name: "adminAccounts",
  initialState: createInitialState(),

  reducers: {
    clearAdminEditFeedback: (state) => {
      state.editError = null;
      state.editMessage = null;
    },

    clearAdminRegisterFeedback: (state) => {
      state.registerError = null;
      state.registerMessage = null;

      if (state.registerStatus !== "loading") {
        state.registerStatus = "idle";
        state.registeredAdmin = null;
      }
    },

    clearAdminDeleteFeedback: (state, action) => {
      const request = state.deleteRequests[action.payload];

      if (request && request.status !== "loading") {
        delete state.deleteRequests[action.payload];
      }
    },

    clearAdminDetails: (state) => {
      state.admin = null;
      state.requestedAdminId = null;
      state.detailsStatus = "idle";
      state.detailsError = null;
      state.detailsRequestId = null;
      state.editError = null;
      state.editMessage = null;
    },

    resetAdminAccounts: () => createInitialState(),
  },

  extraReducers: (builder) => {
    builder
      // ALL ADMINS
      .addCase(fetchAllAdmins.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listRequestId = action.meta.requestId;
        state.listRequestRevision = state.revision;
        state.admins = [];
      })

      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;

        state.listRequestId = null;

        if (state.listRequestRevision !== state.revision) {
          state.listStatus = "idle";
          state.listNeedsRefresh = true;
          return;
        }

        state.admins = action.payload.admins;
        state.pagination = action.payload.pagination;
        state.listStatus = "succeeded";
        state.listError = null;
        state.listNeedsRefresh = false;
      })

      .addCase(fetchAllAdmins.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;

        state.listRequestId = null;

        if (action.meta.aborted) {
          state.listStatus = "idle";
          return;
        }

        state.listStatus = "failed";
        state.listError =
          action.payload || action.error.message || "Unable to load admins.";
      })

      // ADMIN DETAILS
      .addCase(fetchAdminDetails.pending, (state, action) => {
        state.admin = null;
        state.requestedAdminId = action.meta.arg;
        state.detailsStatus = "loading";
        state.detailsError = null;
        state.detailsRequestId = action.meta.requestId;
        state.editError = null;
        state.editMessage = null;
      })

      .addCase(fetchAdminDetails.fulfilled, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;

        state.admin = action.payload.admin;
        state.detailsStatus = "succeeded";
        state.detailsRequestId = null;
      })

      .addCase(fetchAdminDetails.rejected, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;

        state.detailsRequestId = null;

        if (action.meta.aborted) {
          state.detailsStatus = "idle";
          return;
        }

        state.detailsStatus = "failed";
        state.detailsError =
          action.payload ||
          action.error.message ||
          "Unable to load admin information.";
      })

      // EDIT ADMIN
      .addCase(editAdminAccount.pending, (state, action) => {
        state.editingAdminId = action.meta.arg.adminId;
        state.editStatus = "loading";
        state.editError = null;
        state.editMessage = null;
        state.editRequestId = action.meta.requestId;
      })

      .addCase(editAdminAccount.fulfilled, (state, action) => {
        if (state.editRequestId !== action.meta.requestId) return;

        const { adminId } = action.meta.arg;
        const updatedAdmin = action.payload.admin;

        state.editStatus = "succeeded";
        state.editMessage =
          action.payload.message || "Admin updated successfully.";
        state.editRequestId = null;
        state.editingAdminId = null;

        if (state.requestedAdminId === adminId) {
          // Preserve fields omitted from the edit response.
          state.admin = {
            ...state.admin,
            ...updatedAdmin,
            createdAt: updatedAdmin.createdAt ?? state.admin?.createdAt ?? null,
          };

          state.detailsStatus = "succeeded";
          state.detailsError = null;

          // Ignore an older details request.
          state.detailsRequestId = null;
        }

        const index = state.admins.findIndex((admin) => admin._id === adminId);

        if (index !== -1) {
          state.admins[index] = {
            ...state.admins[index],
            ...updatedAdmin,
            createdAt: updatedAdmin.createdAt ?? state.admins[index].createdAt,
          };
        }

        state.revision += 1;
        state.listNeedsRefresh = true;
      })

      .addCase(editAdminAccount.rejected, (state, action) => {
        if (state.editRequestId !== action.meta.requestId) return;

        state.editStatus = "failed";
        state.editError =
          action.payload || action.error.message || "Unable to update admin.";

        state.editRequestId = null;
        state.editingAdminId = null;
      })

      // DELETE ADMIN
      .addCase(deleteAdminAccount.pending, (state, action) => {
        state.deleteRequests[action.meta.arg] = {
          status: "loading",
          error: null,
          message: null,
          requestId: action.meta.requestId,
        };
      })

      .addCase(deleteAdminAccount.fulfilled, (state, action) => {
        const adminId = action.meta.arg;
        const request = state.deleteRequests[adminId];

        if (request?.requestId !== action.meta.requestId) return;

        state.deleteRequests[adminId] = {
          status: "succeeded",
          error: null,
          message: action.payload.message || "Admin deleted successfully.",
          requestId: null,
        };

        state.admins = state.admins.filter((admin) => admin._id !== adminId);

        if (state.requestedAdminId === adminId) {
          state.admin = null;
          state.requestedAdminId = null;
          state.detailsStatus = "idle";
          state.detailsError = null;
          state.detailsRequestId = null;
        }

        // Refetch for accurate totals and page boundaries.
        state.revision += 1;
        state.listNeedsRefresh = true;
      })

      .addCase(deleteAdminAccount.rejected, (state, action) => {
        const request = state.deleteRequests[action.meta.arg];

        if (request?.requestId !== action.meta.requestId) return;

        request.status = "failed";
        request.error =
          action.payload || action.error.message || "Unable to delete admin.";

        request.requestId = null;
      })

      .addCase(registerAdminAccount.pending, (state, action) => {
        state.registerStatus = "loading";
        state.registerError = null;
        state.registerMessage = null;
        state.registeredAdmin = null;
        state.registerRequestId = action.meta.requestId;
      })

      .addCase(registerAdminAccount.fulfilled, (state, action) => {
        if (state.registerRequestId !== action.meta.requestId) return;

        state.registerStatus = "succeeded";
        state.registerMessage =
          action.payload.message || "Admin registered successfully.";

        state.registeredAdmin = action.payload.admin;
        state.registerRequestId = null;

        // Refetch the backend list for accurate filters and pagination.
        state.revision += 1;
        state.listNeedsRefresh = true;
      })

      .addCase(registerAdminAccount.rejected, (state, action) => {
        if (state.registerRequestId !== action.meta.requestId) return;

        state.registerStatus = "failed";
        state.registerError =
          action.payload || action.error.message || "Unable to register admin.";

        state.registerRequestId = null;
      })

      // Clear account management data after admin logout.
      .addCase(logoutAdmin.fulfilled, () => createInitialState());
  },
});

export const {
  clearAdminRegisterFeedback,
  clearAdminEditFeedback,
  clearAdminDeleteFeedback,
  clearAdminDetails,
  resetAdminAccounts,
} = adminAccountsSlice.actions;

export default adminAccountsSlice.reducer;
