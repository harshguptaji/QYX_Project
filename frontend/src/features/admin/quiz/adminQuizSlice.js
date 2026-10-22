import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAdminQuizApi,
  createQuizApi,
  updateQuizApi,
  addQuestionApi,
  updateQuestionApi,
  deleteQuestionApi,
  reorderQuestionsApi,
} from "./adminQuizApi.js";

const initialState = {
  quiz: null,
  loading: false,
  saving: false,
  currentAction: null,
  notFound: false,
  needsRefresh: false,
  error: null,
  validationErrors: [],
  successMessage: null,
};

const getError = (error) => ({
  status: error.response?.status ?? null,
  message:
    error.response?.data?.message ||
    error.message ||
    "Unable to process this request.",
  errors: error.response?.data?.errors ?? [],
});

// Fetch the quiz, including scores and tags.
export const fetchAdminQuiz = createAsyncThunk(
  "adminQuiz/fetch",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getAdminQuizApi(signal);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { loading, saving } = getState().adminQuiz;

      return !loading && !saving;
    },
  }
);

// Shared logic for create/update/question operations.
const createQuizMutation = (
  actionName,
  apiFunction,
  requiresVersion = true
) =>
  createAsyncThunk(
    `adminQuiz/${actionName}`,
    async (fields, { getState, rejectWithValue }) => {
      try {
        let payload = fields ?? {};

        if (requiresVersion) {
          const { quiz } = getState().adminQuiz;

          if (!quiz) {
            return rejectWithValue({
              status: null,
              message: "Please load the quiz before making changes.",
              errors: [],
            });
          }

          payload = {
            ...payload,
            version: quiz.version,
          };
        }

        return await apiFunction(payload);
      } catch (error) {
        return rejectWithValue(getError(error));
      }
    },
    {
      condition: (_, { getState }) => {
        const { loading, saving, needsRefresh } =
          getState().adminQuiz;

        return !loading && !saving && !needsRefresh;
      },
    }
  );

export const createAdminQuiz = createQuizMutation(
  "create",
  createQuizApi,
  false
);

export const updateAdminQuiz = createQuizMutation(
  "update",
  updateQuizApi
);

export const addQuizQuestion = createQuizMutation(
  "addQuestion",
  addQuestionApi
);

export const updateQuizQuestion = createQuizMutation(
  "updateQuestion",
  updateQuestionApi
);

export const deleteQuizQuestion = createQuizMutation(
  "deleteQuestion",
  deleteQuestionApi
);

export const reorderQuizQuestions = createQuizMutation(
  "reorderQuestions",
  reorderQuestionsApi
);

const mutationThunks = [
  createAdminQuiz,
  updateAdminQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
];

const adminQuizSlice = createSlice({
  name: "adminQuiz",
  initialState,

  reducers: {
    clearAdminQuizMessages: (state) => {
      state.error = null;
      state.validationErrors = [];
      state.successMessage = null;
    },

    resetAdminQuiz: () => ({ ...initialState }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminQuiz.pending, (state, action) => {
        state.loading = true;
        state.currentAction = action.meta.requestId;
        state.error = null;
        state.validationErrors = [];
        state.successMessage = null;
        state.notFound = false;
      })

      .addCase(fetchAdminQuiz.fulfilled, (state, action) => {
        // Ignore results from requests started before a reset.
        if (state.currentAction !== action.meta.requestId) return;

        state.loading = false;
        state.currentAction = null;
        state.quiz = action.payload.quiz;
        state.notFound = false;
        state.needsRefresh = false;
      })

      .addCase(fetchAdminQuiz.rejected, (state, action) => {
        if (state.currentAction !== action.meta.requestId) return;

        state.loading = false;
        state.currentAction = null;

        if (action.meta.aborted) return;

        const error = action.payload ?? {
          status: null,
          message: action.error.message || "Unable to fetch quiz.",
          errors: [],
        };

        if (error.status === 404) {
          state.quiz = null;
          state.notFound = true;
          state.needsRefresh = false;
          return;
        }

        state.error = error.message;
        state.validationErrors = error.errors;
      });

    mutationThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.saving = true;
          state.currentAction = action.meta.requestId;
          state.error = null;
          state.validationErrors = [];
          state.successMessage = null;
        })

        .addCase(thunk.fulfilled, (state, action) => {
          if (state.currentAction !== action.meta.requestId) return;

          state.saving = false;
          state.currentAction = null;
          state.quiz = action.payload.quiz;
          state.notFound = false;
          state.needsRefresh = false;
          state.successMessage = action.payload.message;
        })

        .addCase(thunk.rejected, (state, action) => {
          if (state.currentAction !== action.meta.requestId) return;

          state.saving = false;
          state.currentAction = null;

          const error = action.payload ?? {
            status: null,
            message: action.error.message || "Unable to save changes.",
            errors: [],
          };

          state.error = error.message;
          state.validationErrors = error.errors;

          if (error.status === 409) {
            state.needsRefresh = true;
          }
        });
    });
  },
});

export const {
  clearAdminQuizMessages,
  resetAdminQuiz,
} = adminQuizSlice.actions;

export default adminQuizSlice.reducer;