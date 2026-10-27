import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  submitCareerApplicationAPI,
  getCareerApplicationsAPI,
  getCareerStatsAPI,
  getCareerApplicationAPI,
  updateCareerReadStatusAPI,
  reviewCareerApplicationAPI,
} from "./careerAPI";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong.";

// Public: submit application
export const submitCareerApplication = createAsyncThunk(
  "career/submitApplication",
  async (fields, { rejectWithValue }) => {
    try {
      return await submitCareerApplicationAPI(fields);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().career.submitStatus !== "loading",
  }
);

// Admin: all applications
export const fetchCareerApplications = createAsyncThunk(
  "career/fetchApplications",
  async (filters = {}, { rejectWithValue, signal }) => {
    try {
      return await getCareerApplicationsAPI({
        ...filters,
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin: application details
export const fetchCareerApplication = createAsyncThunk(
  "career/fetchApplication",
  async (applicationId, { rejectWithValue, signal }) => {
    try {
      return await getCareerApplicationAPI(
        applicationId,
        signal
      );
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin: statistics
export const fetchCareerStats = createAsyncThunk(
  "career/fetchStats",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getCareerStatsAPI(signal);
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin: mark read/unread
export const updateCareerReadStatus = createAsyncThunk(
  "career/updateReadStatus",
  async (fields, { rejectWithValue }) => {
    try {
      return await updateCareerReadStatusAPI(fields);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: ({ applicationId }, { getState }) =>
      getState().career.updates[applicationId]?.status !== "loading",
  }
);

// Admin: update status/notes
export const reviewCareerApplication = createAsyncThunk(
  "career/reviewApplication",
  async (fields, { rejectWithValue }) => {
    try {
      return await reviewCareerApplicationAPI(fields);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: ({ applicationId }, { getState }) =>
      getState().career.updates[applicationId]?.status !== "loading",
  }
);

const createInitialState = () => ({
  // Public submission
  submitStatus: "idle",
  submitError: null,
  submitMessage: null,
  submittedApplicationId: null,
  submitRequestId: null,

  // Admin list
  applications: [],

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

  // Admin details
  application: null,
  requestedApplicationId: null,
  detailsStatus: "idle",
  detailsError: null,
  detailsRequestId: null,

  // Read/review requests, stored per application
  updates: {},

  // Dashboard statistics
  stats: {
    total: 0,
    read: 0,
    unread: 0,
    byStatus: {
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      contacted: 0,
      hired: 0,
      rejected: 0,
    },
  },

  statsStatus: "idle",
  statsError: null,
  statsRequestId: null,
  statsNeedsRefresh: false,

  // Invalidate list and stats responses after changes.
  revision: 0,
  listRequestRevision: null,
  statsRequestRevision: null,
});

const careerSlice = createSlice({
  name: "career",
  initialState: createInitialState(),

  reducers: {
    clearCareerSubmitFeedback: (state) => {
      state.submitError = null;
      state.submitMessage = null;
    },

    resetCareerSubmission: (state) => {
      state.submitStatus = "idle";
      state.submitError = null;
      state.submitMessage = null;
      state.submittedApplicationId = null;
      state.submitRequestId = null;
    },

    clearCareerDetails: (state) => {
      state.application = null;
      state.requestedApplicationId = null;
      state.detailsStatus = "idle";
      state.detailsError = null;
      state.detailsRequestId = null;
    },

    clearCareerUpdateFeedback: (state, action) => {
      const update = state.updates[action.payload];

      if (update && update.status !== "loading") {
        delete state.updates[action.payload];
      }
    },

    resetCareerState: () => createInitialState(),
  },

  extraReducers: (builder) => {
    builder
      // PUBLIC SUBMISSION
      .addCase(submitCareerApplication.pending, (state, action) => {
        state.submitStatus = "loading";
        state.submitError = null;
        state.submitMessage = null;
        state.submittedApplicationId = null;
        state.submitRequestId = action.meta.requestId;
      })

      .addCase(submitCareerApplication.fulfilled, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitStatus = "succeeded";
        state.submitMessage =
          action.payload.message ||
          "Your career enquiry has been submitted.";

        state.submittedApplicationId =
          action.payload.applicationId || null;

        state.submitRequestId = null;

        state.revision += 1;
        state.listNeedsRefresh = true;
        state.statsNeedsRefresh = true;
      })

      .addCase(submitCareerApplication.rejected, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitStatus = "failed";
        state.submitError =
          action.payload ||
          action.error.message ||
          "Unable to submit your career enquiry.";

        state.submitRequestId = null;
      })

      // APPLICATION LIST
      .addCase(fetchCareerApplications.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listRequestId = action.meta.requestId;
        state.listRequestRevision = state.revision;
        state.applications = [];
      })

      .addCase(fetchCareerApplications.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;

        state.listRequestId = null;

        if (state.listRequestRevision !== state.revision) {
          state.listStatus = "idle";
          state.listNeedsRefresh = true;
          return;
        }

        state.applications = action.payload.applications;
        state.pagination = action.payload.pagination;
        state.listStatus = "succeeded";
        state.listError = null;
        state.listNeedsRefresh = false;
      })

      .addCase(fetchCareerApplications.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;

        state.listRequestId = null;

        if (action.meta.aborted) {
          state.listStatus = "idle";
          return;
        }

        state.listStatus = "failed";
        state.listError =
          action.payload ||
          action.error.message ||
          "Unable to load career applications.";
      })

      // APPLICATION DETAILS
      .addCase(fetchCareerApplication.pending, (state, action) => {
        state.application = null;
        state.requestedApplicationId = action.meta.arg;
        state.detailsStatus = "loading";
        state.detailsError = null;
        state.detailsRequestId = action.meta.requestId;
      })

      .addCase(fetchCareerApplication.fulfilled, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;

        state.application = action.payload.application;
        state.detailsStatus = "succeeded";
        state.detailsError = null;
        state.detailsRequestId = null;
      })

      .addCase(fetchCareerApplication.rejected, (state, action) => {
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
          "Unable to load application details.";
      })

      // MARK READ/UNREAD
      .addCase(updateCareerReadStatus.pending, (state, action) => {
        const { applicationId } = action.meta.arg;

        state.updates[applicationId] = {
          status: "loading",
          error: null,
          message: null,
          requestId: action.meta.requestId,
        };
      })

      .addCase(updateCareerReadStatus.fulfilled, (state, action) => {
        const { applicationId } = action.meta.arg;
        const update = state.updates[applicationId];

        if (update?.requestId !== action.meta.requestId) return;

        const updated = action.payload.application;

        state.updates[applicationId] = {
          status: "succeeded",
          error: null,
          message:
            action.payload.message || "Read status updated.",
          requestId: null,
        };

        if (state.requestedApplicationId === applicationId) {
          state.application = updated;
          state.detailsStatus = "succeeded";
          state.detailsError = null;

          // Ignore an older details response.
          state.detailsRequestId = null;
        }

        const index = state.applications.findIndex(
          (item) => item._id === applicationId
        );

        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            ...updated,
          };
        }

        state.revision += 1;
        state.listNeedsRefresh = true;
        state.statsNeedsRefresh = true;
      })

      .addCase(updateCareerReadStatus.rejected, (state, action) => {
        const { applicationId } = action.meta.arg;
        const update = state.updates[applicationId];

        if (update?.requestId !== action.meta.requestId) return;

        update.status = "failed";
        update.error =
          action.payload ||
          action.error.message ||
          "Unable to update read status.";

        update.requestId = null;
      })

      // UPDATE REVIEW
      .addCase(reviewCareerApplication.pending, (state, action) => {
        const { applicationId } = action.meta.arg;

        state.updates[applicationId] = {
          status: "loading",
          error: null,
          message: null,
          requestId: action.meta.requestId,
        };
      })

      .addCase(reviewCareerApplication.fulfilled, (state, action) => {
        const { applicationId } = action.meta.arg;
        const update = state.updates[applicationId];

        if (update?.requestId !== action.meta.requestId) return;

        const updated = action.payload.application;

        state.updates[applicationId] = {
          status: "succeeded",
          error: null,
          message:
            action.payload.message || "Application review updated.",
          requestId: null,
        };

        if (state.requestedApplicationId === applicationId) {
          state.application = updated;
          state.detailsStatus = "succeeded";
          state.detailsError = null;
          state.detailsRequestId = null;
        }

        const index = state.applications.findIndex(
          (item) => item._id === applicationId
        );

        if (index !== -1) {
          state.applications[index] = {
            ...state.applications[index],
            ...updated,
          };
        }

        state.revision += 1;
        state.listNeedsRefresh = true;
        state.statsNeedsRefresh = true;
      })

      .addCase(reviewCareerApplication.rejected, (state, action) => {
        const { applicationId } = action.meta.arg;
        const update = state.updates[applicationId];

        if (update?.requestId !== action.meta.requestId) return;

        update.status = "failed";
        update.error =
          action.payload ||
          action.error.message ||
          "Unable to update the application.";

        update.requestId = null;
      })

      // STATISTICS
      .addCase(fetchCareerStats.pending, (state, action) => {
        state.statsStatus = "loading";
        state.statsError = null;
        state.statsRequestId = action.meta.requestId;
        state.statsRequestRevision = state.revision;
      })

      .addCase(fetchCareerStats.fulfilled, (state, action) => {
        if (state.statsRequestId !== action.meta.requestId) return;

        state.statsRequestId = null;

        if (state.statsRequestRevision !== state.revision) {
          state.statsStatus = "idle";
          state.statsNeedsRefresh = true;
          return;
        }

        state.stats = action.payload.stats;
        state.statsStatus = "succeeded";
        state.statsNeedsRefresh = false;
      })

      .addCase(fetchCareerStats.rejected, (state, action) => {
        if (state.statsRequestId !== action.meta.requestId) return;

        state.statsRequestId = null;

        if (action.meta.aborted) {
          state.statsStatus = "idle";
          return;
        }

        state.statsStatus = "failed";
        state.statsError =
          action.payload ||
          action.error.message ||
          "Unable to load career statistics.";
      });
  },
});

export const {
  clearCareerSubmitFeedback,
  resetCareerSubmission,
  clearCareerDetails,
  clearCareerUpdateFeedback,
  resetCareerState,
} = careerSlice.actions;

export default careerSlice.reducer;