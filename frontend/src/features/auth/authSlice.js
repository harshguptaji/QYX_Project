import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { registerUserAPI, loginUserAPI, getCurrentUserAPI } from "./authAPI";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong.";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUserAPI({
        userName: userData.userName,
        userEmail: userData.userEmail,
        userMobile: userData.userMobile,
        userPassword: userData.userPassword,
        userCity: userData.userCity,
        userDOB: userData.userDOB,
        userGender: userData.userGender,
      });

      if (response.success !== true) {
        return rejectWithValue(
          response.message || "Registration failed."
        );
      }

      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await loginUserAPI({
        userEmail: userData.userEmail,
        userPassword: userData.userPassword,
      });

      if (response.success !== true || !response.user?.id) {
        throw new Error(response.message || "Login failed.");
      }

      return {
        user: response.user,
        message: response.message || "Login successful.",
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUserAPI();

      if (response.success !== true || !response.user?.id) {
        throw new Error("Unable to retrieve your account.");
      }

      const user = response.user;

      return {
        id: user.id,
        name: user.userName,
        email: user.userEmail,
        mobile: user.userMobile,
        role: user.userRole,
        city: user.userCity,
        dob: user.userDOB,
        gender: user.userGender,
        photo: user.userPhoto,
        userVerified: user.userVerified,
        mobileVerified: user.mobileVerified,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error),
        status: error.response?.status ?? null,
      });
    }
  },
  {
    condition: (_, { getState }) =>
      getState().auth.sessionStatus !== "loading",
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,


  // Signup reads these fields.
  registerStatus: "idle",
  registerError: null,
  // Login reads these fields.
  loginStatus: "idle",
  loginError: null,
    // Session reads these fields.
  sessionStatus: "idle",
  sessionError: null,

  // Retained for compatibility with your existing components.
  isLoading: false,
  error: null,
  successMessage: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.registerError = null;
      state.loginError = null;
    },

    clearAuthMessage: (state) => {
      state.successMessage = null;
    },

    clearAuthFeedback: (state) => {
      state.error = null;
      state.registerError = null;
      state.loginError = null;
      state.successMessage = null;

      if (state.registerStatus !== "loading") {
        state.registerStatus = "idle";
      }

      if (state.loginStatus !== "loading") {
        state.loginStatus = "idle";
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Registration
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = "loading";
        state.isLoading = true;
        state.registerError = null;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerStatus = "succeeded";
        state.isLoading = state.loginStatus === "loading";
        state.registerError = null;
        state.error = null;
        state.successMessage =
          action.payload.message || "Registration successful.";
      })

      .addCase(registerUser.rejected, (state, action) => {
        const message =
          action.payload ||
          action.error.message ||
          "Registration failed.";

        state.registerStatus = "failed";
        state.isLoading = state.loginStatus === "loading";
        state.registerError = message;
        state.error = message;
      })

      // Login — continue the same builder chain
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.isLoading = true;
        state.loginError = null;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.isLoading = state.registerStatus === "loading";
        state.loginError = null;
        state.error = null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        state.successMessage = action.payload.message;
      })

      .addCase(loginUser.rejected, (state, action) => {
        const message =
          action.payload ||
          action.error.message ||
          "Login failed.";

        state.loginStatus = "failed";
        state.isLoading = state.registerStatus === "loading";
        state.loginError = message;
        state.error = message;
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.sessionStatus = "loading";
        state.sessionError = null;
        })

        .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.sessionStatus = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
        })

        .addCase(getCurrentUser.rejected, (state, action) => {
        state.sessionStatus = "failed";
        state.isAuthChecked = true;
        state.sessionError =
            action.payload?.message || "Unable to check your session.";

        // Clear login only when the backend confirms no valid session.
        if (action.payload?.status === 401) {
            state.user = null;
            state.isAuthenticated = false;
        }
        });
  },
});

export const {
  clearAuthError,
  clearAuthMessage,
  clearAuthFeedback,
} = authSlice.actions;

export default authSlice.reducer;