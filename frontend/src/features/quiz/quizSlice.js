import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getPublicQuizAPI,
  submitQuizResponseAPI,
} from "./quizApi.js";

const initialState = {
  quiz: null,
  loading: false,
  submitting: false,
  responseId: null,
  error: null,
  validationErrors: [],
  needsRestart: false,
  fetchRequestId: null,
  submitRequestId: null,
};

const getError = (error) => ({
  status: error.response?.status ?? null,
  message:
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again.",
  errors: error.response?.data?.errors ?? [],
});

export const fetchPublicQuiz = createAsyncThunk(
  "quiz/fetch",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getPublicQuizAPI(signal);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  }
);

export const submitPublicQuiz = createAsyncThunk(
  "quiz/submit",
  async (fields, { rejectWithValue }) => {
    try {
      return await submitQuizResponseAPI(fields);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().quiz;

      return (
        !state.loading &&
        !state.submitting &&
        !state.needsRestart &&
        !state.responseId
      );
    },
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,

  reducers: {
    clearQuizError: (state) => {
      state.error = null;
      state.validationErrors = [];
    },

    resetQuiz: () => ({ ...initialState }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicQuiz.pending, (state, action) => {
        state.loading = true;
        state.quiz = null;
        state.error = null;
        state.validationErrors = [];
        state.needsRestart = false;
        state.fetchRequestId = action.meta.requestId;
      })

      .addCase(fetchPublicQuiz.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;

        state.loading = false;
        state.fetchRequestId = null;
        state.quiz = action.payload.quiz;
      })

      .addCase(fetchPublicQuiz.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;

        state.loading = false;
        state.fetchRequestId = null;

        if (action.meta.aborted) return;

        const error = action.payload ?? {
          message: action.error.message || "Unable to load quiz.",
          errors: [],
        };

        state.error = error.message;
        state.validationErrors = error.errors;
      })

      .addCase(submitPublicQuiz.pending, (state, action) => {
        state.submitting = true;
        state.error = null;
        state.validationErrors = [];
        state.submitRequestId = action.meta.requestId;
      })

      .addCase(submitPublicQuiz.fulfilled, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitting = false;
        state.submitRequestId = null;
        state.responseId = action.payload.responseId;
      })

      .addCase(submitPublicQuiz.rejected, (state, action) => {
        if (state.submitRequestId !== action.meta.requestId) return;

        state.submitting = false;
        state.submitRequestId = null;

        const error = action.payload ?? {
          message: action.error.message || "Unable to submit quiz.",
          errors: [],
        };

        state.error = error.message;
        state.validationErrors = error.errors;
        state.needsRestart = error.status === 409;
      });
  },
});

export const {
  clearQuizError,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;