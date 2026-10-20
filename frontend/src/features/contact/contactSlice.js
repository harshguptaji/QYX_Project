import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  submitContactAPI,
  getContactsAPI,
  getContactDetailsAPI,
  updateContactReadStatusAPI,
  getContactStatsAPI,
} from "./contactAPI";

import { logoutAdmin } from "../admin/auth/adminAuthSlice";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong.";

// Public: submit contact form
export const submitContact = createAsyncThunk(
  "contact/submit",
  async (fields, { rejectWithValue }) => {
    try {
      return await submitContactAPI(fields);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().contact.submitStatus !== "loading",
  }
);

// Admin: contacts with backend pagination and filters
export const fetchContacts = createAsyncThunk(
  "contact/fetchAll",
  async (filters = {}, { rejectWithValue, signal }) => {
    try {
      return await getContactsAPI({
        ...filters,
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin: contact details
export const fetchContactDetails = createAsyncThunk(
  "contact/fetchDetails",
  async (contactId, { rejectWithValue, signal }) => {
    try {
      return await getContactDetailsAPI(contactId, signal);
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin: mark read or unread
export const updateContactReadStatus = createAsyncThunk(
  "contact/updateReadStatus",
  async ({ contactId, isRead }, { rejectWithValue }) => {
    try {
      return await updateContactReadStatusAPI({
        contactId,
        isRead,
      });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: ({ contactId }, { getState }) =>
      getState().contact.readUpdates[contactId]?.status !== "loading",
  }
);

// Admin: dashboard counts
export const fetchContactStats = createAsyncThunk(
  "contact/fetchStats",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getContactStatsAPI(signal);
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const createInitialState = () => ({
  // Public form
  submitStatus: "idle",
  submitError: null,
  submitMessage: null,
  submittedContactId: null,
  submitRequestId: null,

  // Admin list
  contacts: [],
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
  contact: null,
  requestedContactId: null,
  detailsStatus: "idle",
  detailsError: null,
  detailsRequestId: null,

  // Per-message read/unread update state
  readUpdates: {},

  // Admin statistics
  stats: {
    total: 0,
    read: 0,
    unread: 0,
  },
  statsStatus: "idle",
  statsError: null,
  statsRequestId: null,
  statsNeedsRefresh: false,

  // Prevent older reads from overwriting newer changes.
  revision: 0,
  listRequestRevision: null,
  detailsRequestRevision: null,
  statsRequestRevision: null,
});

const contactSlice = createSlice({
  name: "contact",
  initialState: createInitialState(),

  reducers: {
    clearContactSubmitFeedback: (state) => {
      state.submitError = null;
      state.submitMessage = null;
    },

    resetContactSubmission: (state) => {
      state.submitStatus = "idle";
      state.submitError = null;
      state.submitMessage = null;
      state.submittedContactId = null;
      state.submitRequestId = null;
    },

    clearContactDetails: (state) => {
      state.contact = null;
      state.requestedContactId = null;
      state.detailsStatus = "idle";
      state.detailsError = null;
      state.detailsRequestId = null;
      state.detailsRequestRevision = null;
    },

    clearContactReadFeedback: (state, action) => {
      const update = state.readUpdates[action.payload];

      if (update && update.status !== "loading") {
        delete state.readUpdates[action.payload];
      }
    },

    resetContactState: () => createInitialState(),
  },

  extraReducers: (builder) => {
    builder
      // SUBMIT CONTACT
      .addCase(submitContact.pending, (state, action) => {
        state.submitStatus = "loading";
        state.submitError = null;
        state.submitMessage = null;
        state.submittedContactId = null;
        state.submitRequestId = action.meta.requestId;
      })

      .addCase(submitContact.fulfilled, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitStatus = "succeeded";
        state.submitMessage =
          action.payload.message || "Message submitted successfully.";
        state.submittedContactId =
          action.payload.contactId || null;
        state.submitRequestId = null;

        state.revision += 1;
        state.listNeedsRefresh = true;
        state.statsNeedsRefresh = true;
      })

      .addCase(submitContact.rejected, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitStatus = "failed";
        state.submitError =
          action.payload ||
          action.error.message ||
          "Unable to submit your message.";
        state.submitRequestId = null;
      })

      // FETCH CONTACT LIST
      .addCase(fetchContacts.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listRequestId = action.meta.requestId;
        state.listRequestRevision = state.revision;
        state.contacts = [];
      })

      .addCase(fetchContacts.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;

        state.listRequestId = null;

        if (state.listRequestRevision !== state.revision) {
          state.listStatus = "idle";
          state.listNeedsRefresh = true;
          return;
        }

        state.contacts = action.payload.contacts;
        state.pagination = action.payload.pagination;
        state.listStatus = "succeeded";
        state.listError = null;
        state.listNeedsRefresh = false;
      })

      .addCase(fetchContacts.rejected, (state, action) => {
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
          "Unable to load contacts.";
      })

      // FETCH CONTACT DETAILS
      .addCase(fetchContactDetails.pending, (state, action) => {
        state.contact = null;
        state.requestedContactId = action.meta.arg;
        state.detailsStatus = "loading";
        state.detailsError = null;
        state.detailsRequestId = action.meta.requestId;
        state.detailsRequestRevision = state.revision;
      })

      .addCase(fetchContactDetails.fulfilled, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;

        const result = { ...action.payload.contact };
        const update = state.readUpdates[result._id];

        // Preserve a newer successful read/unread update.
        if (
          state.detailsRequestRevision !== state.revision &&
          update?.contact
        ) {
          result.isRead = update.contact.isRead;
          result.readAt = update.contact.readAt;
          result.readBy = update.contact.readBy;
        }

        state.contact = result;
        state.detailsStatus = "succeeded";
        state.detailsRequestId = null;
      })

      .addCase(fetchContactDetails.rejected, (state, action) => {
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
          "Unable to load contact details.";
      })

      // UPDATE READ STATUS
      .addCase(updateContactReadStatus.pending, (state, action) => {
        const { contactId } = action.meta.arg;

        state.readUpdates[contactId] = {
          status: "loading",
          error: null,
          message: null,
          requestId: action.meta.requestId,
          contact: null,
        };
      })

      .addCase(updateContactReadStatus.fulfilled, (state, action) => {
        const { contactId } = action.meta.arg;
        const update = state.readUpdates[contactId];

        if (update?.requestId !== action.meta.requestId) return;

        const updatedContact = action.payload.contact;

        state.readUpdates[contactId] = {
          status: "succeeded",
          error: null,
          message: action.payload.message,
          requestId: null,
          contact: {
            isRead: updatedContact.isRead,
            readAt: updatedContact.readAt,
            readBy: updatedContact.readBy,
          },
        };

        if (state.requestedContactId === contactId) {
          state.contact = updatedContact;
          state.detailsStatus = "succeeded";
          state.detailsError = null;

          // Ignore any older details request still in progress.
          state.detailsRequestId = null;
        }

        const index = state.contacts.findIndex(
          (item) => item._id === contactId
        );

        if (index !== -1) {
          state.contacts[index] = {
            ...state.contacts[index],
            ...updatedContact,
          };
        }

        state.revision += 1;
        state.listNeedsRefresh = true;
        state.statsNeedsRefresh = true;
      })

      .addCase(updateContactReadStatus.rejected, (state, action) => {
        const { contactId } = action.meta.arg;
        const update = state.readUpdates[contactId];

        if (update?.requestId !== action.meta.requestId) return;

        update.status = "failed";
        update.error =
          action.payload ||
          action.error.message ||
          "Unable to update read status.";
        update.requestId = null;
      })

      // FETCH STATISTICS
      .addCase(fetchContactStats.pending, (state, action) => {
        state.statsStatus = "loading";
        state.statsError = null;
        state.statsRequestId = action.meta.requestId;
        state.statsRequestRevision = state.revision;
      })

      .addCase(fetchContactStats.fulfilled, (state, action) => {
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

      .addCase(fetchContactStats.rejected, (state, action) => {
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
          "Unable to load contact statistics.";
      })

      // Clear contact information after admin logout.
      .addCase(logoutAdmin.fulfilled, () => createInitialState());
  },
});

export const {
  clearContactSubmitFeedback,
  resetContactSubmission,
  clearContactDetails,
  clearContactReadFeedback,
  resetContactState,
} = contactSlice.actions;

export default contactSlice.reducer;