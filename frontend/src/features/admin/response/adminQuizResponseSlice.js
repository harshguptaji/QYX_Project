import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAdminQuizResponsesAPI,
  getAdminQuizResponseDetailsAPI,
} from "./adminQuizResponseApi.js";

const initialState = {
  responses: [],

  pagination: {
    page: 1,
    limit: 10,
    totalResponses: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  // Filters belonging to the latest requested list.
  filters: {
    search: "",
    leadCategory: "",
    purposeOfVisiting: "",
  },

  loading: false,
  error: null,
  listRequestId: null,

  responseDetails: null,
  detailsLoading: false,
  detailsError: null,
  detailsNotFound: false,
  detailsRequestId: null,
};

const getError = (error) => ({
  status: error.response?.status ?? null,
  message:
    error.response?.data?.message ||
    error.message ||
    "Unable to process this request.",
});

const getRejectedMessage = (action, fallback) =>
  action.payload?.message ||
  action.error?.message ||
  fallback;

// List / search / filter / paginate.
export const fetchAdminQuizResponses = createAsyncThunk(
  "adminQuizResponses/fetchAll",
  async (filters = {}, { rejectWithValue, signal }) => {
    try {
      return await getAdminQuizResponsesAPI(filters, signal);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

// Get a particular submission.
export const fetchAdminQuizResponseDetails = createAsyncThunk(
  "adminQuizResponses/fetchDetails",
  async (responseId, { rejectWithValue, signal }) => {
    try {
      return await getAdminQuizResponseDetailsAPI(
        responseId,
        signal
      );
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

const adminQuizResponseSlice = createSlice({
  name: "adminQuizResponses",
  initialState,

  reducers: {
    clearAdminQuizResponseErrors: (state) => {
      state.error = null;
      state.detailsError = null;
    },

    clearAdminQuizResponseDetails: (state) => {
      state.responseDetails = null;
      state.detailsLoading = false;
      state.detailsError = null;
      state.detailsNotFound = false;

      // Ignore any older request that finishes after clearing.
      state.detailsRequestId = null;
    },

    resetAdminQuizResponses: () => ({
      ...initialState,
      pagination: { ...initialState.pagination },
      filters: { ...initialState.filters },
    }),
  },

  extraReducers: (builder) => {
    builder
      // -------------------------
      // Response list
      // -------------------------
      .addCase(fetchAdminQuizResponses.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.listRequestId = action.meta.requestId;

        const filters = action.meta.arg ?? {};

        state.filters = {
          search: filters.search ?? "",
          leadCategory: filters.leadCategory ?? "",
          purposeOfVisiting: filters.purposeOfVisiting ?? "",
        };

        // Avoid displaying old results under new filters.
        state.responses = [];
        state.pagination = {
          ...initialState.pagination,
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
        };
      })

      .addCase(
        fetchAdminQuizResponses.fulfilled,
        (state, action) => {
          // A slower old search must not overwrite a newer search.
          if (state.listRequestId !== action.meta.requestId) {
            return;
          }

          state.loading = false;
          state.listRequestId = null;
          state.responses = action.payload.responses;
          state.pagination = action.payload.pagination;
        }
      )

      .addCase(
        fetchAdminQuizResponses.rejected,
        (state, action) => {
          if (state.listRequestId !== action.meta.requestId) {
            return;
          }

          state.loading = false;
          state.listRequestId = null;

          if (action.meta.aborted) return;

          state.error = getRejectedMessage(
            action,
            "Unable to fetch quiz responses."
          );
        }
      )

      // -------------------------
      // Response details
      // -------------------------
      .addCase(
        fetchAdminQuizResponseDetails.pending,
        (state, action) => {
          state.detailsLoading = true;
          state.detailsError = null;
          state.detailsNotFound = false;
          state.responseDetails = null;
          state.detailsRequestId = action.meta.requestId;
        }
      )

      .addCase(
        fetchAdminQuizResponseDetails.fulfilled,
        (state, action) => {
          if (
            state.detailsRequestId !== action.meta.requestId
          ) {
            return;
          }

          state.detailsLoading = false;
          state.detailsRequestId = null;
          state.responseDetails = action.payload.response;
        }
      )

      .addCase(
        fetchAdminQuizResponseDetails.rejected,
        (state, action) => {
          if (
            state.detailsRequestId !== action.meta.requestId
          ) {
            return;
          }

          state.detailsLoading = false;
          state.detailsRequestId = null;

          if (action.meta.aborted) return;

          state.detailsNotFound =
            action.payload?.status === 404;

          state.detailsError = getRejectedMessage(
            action,
            "Unable to fetch response details."
          );
        }
      );
  },
});

export const {
  clearAdminQuizResponseErrors,
  clearAdminQuizResponseDetails,
  resetAdminQuizResponses,
} = adminQuizResponseSlice.actions;

export default adminQuizResponseSlice.reducer;