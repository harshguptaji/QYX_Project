import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { registerUserAPI, loginUserAPI, getCurrentUserAPI, updateUserProfileAPI, changePasswordAPI, sendEmailVerificationOtpAPI, verifyEmailOtpAPI, sendMobileVerificationOtpAPI, verifyMobileOtpAPI, logoutUserAPI } from "./authAPI";

import { resetPassword } from "./passwordResetSlice";

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


export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { rejectWithValue }) => {
    try {
      // Only send editable profile fields.
      const allowedFields = [
        "userName",
        "userEmail",
        "userMobile",
        "userCity",
        "userDOB",
        "userGender",
      ];

      const payload = {};

      allowedFields.forEach((field) => {
        if (userData[field] !== undefined) {
          payload[field] = userData[field];
        }
      });

      const response = await updateUserProfileAPI(payload);

      if (response.success !== true || !response.user?.id) {
        throw new Error(
          response.message || "Unable to update your profile."
        );
      }

      const user = response.user;

      return {
        message: response.message || "Profile updated successfully.",

        user: {
          id: user.id,
          name: user.userName,
          email: user.userEmail,
          mobile: user.userMobile,
          city: user.userCity,
          dob: user.userDOB ? user.userDOB.slice(0, 10) : "",
          gender: user.userGender,
          role: user.userRole,
          emailVerified: user.emailVerified,
          mobileVerified: user.mobileVerified,
          photo: user.userPhoto,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to update your profile."
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await changePasswordAPI({
        userPassword: passwordData.userPassword,
        updatePassword: passwordData.updatePassword,
      });

      if (response.success !== true) {
        throw new Error(
          response.message || "Unable to change your password."
        );
      }

      return {
        message: response.message || "Password updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to change your password."
      );
    }
  }
);

export const sendEmailVerificationOtp = createAsyncThunk(
  "auth/sendEmailVerificationOtp",
  async (_, { rejectWithValue, getState }) => {
    const email = getState().auth.user?.email;

    if (!email) {
      return rejectWithValue("Please sign in again.");
    }

    try {
      const response = await sendEmailVerificationOtpAPI();

      if (response.success !== true) {
        throw new Error(response.message || "Unable to send OTP.");
      }

      return {
        email,
        message: response.message || "OTP sent successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to send OTP."
      );
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async (otp, { rejectWithValue, getState }) => {
    const email = getState().auth.user?.email;

    if (!email) {
      return rejectWithValue("Please sign in again.");
    }

    try {
      const response = await verifyEmailOtpAPI(otp);

      if (response.success !== true) {
        throw new Error(response.message || "Unable to verify email.");
      }

      return {
        email,
        message: response.message || "Email verified successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to verify email."
      );
    }
  }
);

const mobileVerificationError = (error) => ({
  message:
    error.response?.data?.message ||
    error.message ||
    "Something went wrong.",
  retryAfterSeconds:
    Number(error.response?.data?.retryAfterSeconds) || 0,
});

export const sendMobileVerificationOtp = createAsyncThunk(
  "auth/sendMobileVerificationOtp",
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth.user;

    if (!user?.mobile) {
      return rejectWithValue({
        message: "Please sign in and add your mobile number.",
        retryAfterSeconds: 0,
      });
    }

    try {
      const response = await sendMobileVerificationOtpAPI();

      if (!response.success) {
        return rejectWithValue({
          message: response.message || "Unable to send OTP.",
          retryAfterSeconds: response.retryAfterSeconds || 0,
        });
      }

      return {
        ...response,
        userId: user.id,
        mobile: user.mobile,
      };
    } catch (error) {
      return rejectWithValue(mobileVerificationError(error));
    }
  }
);

export const verifyMobileOtp = createAsyncThunk(
  "auth/verifyMobileOtp",
  async (otp, { getState, rejectWithValue }) => {
    const user = getState().auth.user;

    if (!user?.mobile) {
      return rejectWithValue({
        message: "Please sign in again.",
        retryAfterSeconds: 0,
      });
    }

    try {
      const response = await verifyMobileOtpAPI(String(otp).trim());

      if (!response.success || response.mobileVerified !== true) {
        return rejectWithValue({
          message: response.message || "Unable to verify OTP.",
          retryAfterSeconds: response.retryAfterSeconds || 0,
        });
      }

      return {
        ...response,
        userId: user.id,
        mobile: user.mobile,
      };
    } catch (error) {
      return rejectWithValue(mobileVerificationError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      return await logoutUserAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to log out. Please try again."
      );
    }
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

  // Profile update reads these fields.
  profileUpdateStatus: "idle",
  profileUpdateError: null,
  profileUpdateMessage: null,

  // Password change reads these fields.
  passwordChangeStatus: "idle",
  passwordChangeError: null,
  passwordChangeMessage: null,

  // Email verification reads these fields.
  emailOtpSendStatus: "idle",
  emailOtpSendError: null,
  emailOtpSendMessage: null,

  // Email verification reads these fields.
  emailOtpVerifyStatus: "idle",
  emailOtpVerifyError: null,
  emailOtpVerifyMessage: null,

  // Mobile verification reads these fields.
  mobileOtpSendStatus: "idle",
  mobileOtpSendError: null,
  mobileOtpSendRequestId: null,

  // Mobile verification reads these fields.
  mobileOtpVerifyStatus: "idle",
  mobileOtpVerifyError: null,
  mobileOtpVerifyRequestId: null,

  // Logout reads these fields.
  logoutStatus: "idle",
  logoutError: null,

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
    updateProfileLocally: (state, action) => {
        if (state.user) {
            state.user = {
            ...state.user,
            ...action.payload,
            };
        }
    },
    clearProfileFeedback: (state) => {
      state.profileUpdateError = null;
      state.profileUpdateMessage = null;

      if (state.profileUpdateStatus !== "loading") {
        state.profileUpdateStatus = "idle";
      }
    },
    clearPasswordFeedback: (state) => {
      state.passwordChangeError = null;
      state.passwordChangeMessage = null;

      if (state.passwordChangeStatus !== "loading") {
        state.passwordChangeStatus = "idle";
      }
    },
    clearEmailVerificationFeedback: (state) => {
      state.emailOtpSendError = null;
      state.emailOtpSendMessage = null;
      state.emailOtpVerifyError = null;
      state.emailOtpVerifyMessage = null;
    },
    clearMobileVerificationFeedback: (state) => {
      state.mobileOtpSendError = null;
      state.mobileOtpVerifyError = null;
    },
    clearLogoutError: (state) => {
      state.logoutError = null;
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
        })


        .addCase(updateUserProfile.pending, (state) => {
          state.profileUpdateStatus = "loading";
          state.profileUpdateError = null;
          state.profileUpdateMessage = null;
        })

        .addCase(updateUserProfile.fulfilled, (state, action) => {
          state.profileUpdateStatus = "succeeded";

          state.user = {
            ...state.user,
            ...action.payload.user,
          };

          state.profileUpdateError = null;
          state.profileUpdateMessage = action.payload.message;
        })

        .addCase(updateUserProfile.rejected, (state, action) => {
          state.profileUpdateStatus = "failed";
          state.profileUpdateError =
            action.payload ||
            action.error.message ||
            "Unable to update your profile.";
        })


        .addCase(changePassword.pending, (state) => {
          state.passwordChangeStatus = "loading";
          state.passwordChangeError = null;
          state.passwordChangeMessage = null;
        })

        .addCase(changePassword.fulfilled, (state, action) => {
          state.passwordChangeStatus = "succeeded";
          state.passwordChangeError = null;
          state.passwordChangeMessage = action.payload.message;
        })

        .addCase(changePassword.rejected, (state, action) => {
          state.passwordChangeStatus = "failed";
          state.passwordChangeError =
            action.payload ||
            action.error.message ||
            "Unable to change your password.";
        })

        .addCase(sendEmailVerificationOtp.pending, (state) => {
          state.emailOtpSendStatus = "loading";
          state.emailOtpSendError = null;
          state.emailOtpSendMessage = null;
        })

        .addCase(sendEmailVerificationOtp.fulfilled, (state, action) => {
          state.emailOtpSendStatus = "succeeded";
          state.emailOtpSendMessage = action.payload.message;
        })

        .addCase(sendEmailVerificationOtp.rejected, (state, action) => {
          state.emailOtpSendStatus = "failed";
          state.emailOtpSendError =
            action.payload || "Unable to send OTP.";
        })

        .addCase(verifyEmailOtp.pending, (state) => {
          state.emailOtpVerifyStatus = "loading";
          state.emailOtpVerifyError = null;
          state.emailOtpVerifyMessage = null;
        })

        .addCase(verifyEmailOtp.fulfilled, (state, action) => {
          state.emailOtpVerifyStatus = "succeeded";
          state.emailOtpVerifyMessage = action.payload.message;

          // Do not mark a different email as verified if it changed
          // while the request was running.
          if (state.user?.email === action.payload.email) {
            state.user.emailVerified = true;
          }
        })

        .addCase(verifyEmailOtp.rejected, (state, action) => {
          state.emailOtpVerifyStatus = "failed";
          state.emailOtpVerifyError =
            action.payload || "Unable to verify email.";
        })

        .addCase(sendMobileVerificationOtp.pending, (state, action) => {
          state.mobileOtpSendStatus = "loading";
          state.mobileOtpSendError = null;
          state.mobileOtpSendRequestId = action.meta.requestId;
        })

        .addCase(sendMobileVerificationOtp.fulfilled, (state, action) => {
          if (state.mobileOtpSendRequestId !== action.meta.requestId) return;

          state.mobileOtpSendStatus = "succeeded";
          state.mobileOtpSendRequestId = null;

          if (
            action.payload.mobileVerified === true &&
            state.user?.id === action.payload.userId &&
            state.user?.mobile === action.payload.mobile
          ) {
            state.user.mobileVerified = true;
          }
        })

        .addCase(sendMobileVerificationOtp.rejected, (state, action) => {
          if (state.mobileOtpSendRequestId !== action.meta.requestId) return;

          state.mobileOtpSendStatus = "failed";
          state.mobileOtpSendRequestId = null;
          state.mobileOtpSendError =
            action.payload?.message ||
            action.error.message ||
            "Unable to send OTP.";
        })

        .addCase(verifyMobileOtp.pending, (state, action) => {
          state.mobileOtpVerifyStatus = "loading";
          state.mobileOtpVerifyError = null;
          state.mobileOtpVerifyRequestId = action.meta.requestId;
        })

        .addCase(verifyMobileOtp.fulfilled, (state, action) => {
          if (state.mobileOtpVerifyRequestId !== action.meta.requestId) return;

          state.mobileOtpVerifyStatus = "succeeded";
          state.mobileOtpVerifyRequestId = null;

          if (
            state.user?.id === action.payload.userId &&
            state.user?.mobile === action.payload.mobile
          ) {
            state.user.mobileVerified = true;
          }
        })

        .addCase(verifyMobileOtp.rejected, (state, action) => {
          if (state.mobileOtpVerifyRequestId !== action.meta.requestId) return;

          state.mobileOtpVerifyStatus = "failed";
          state.mobileOtpVerifyRequestId = null;
          state.mobileOtpVerifyError =
            action.payload?.message ||
            action.error.message ||
            "Unable to verify OTP.";
        })


        .addCase(logoutUser.pending, (state) => {
          state.logoutStatus = "loading";
          state.logoutError = null;
        })

        .addCase(logoutUser.fulfilled, () => ({
          ...initialState,
          user: null,
          isAuthenticated: false,
          isAuthChecked: true,
          logoutStatus: "succeeded",
        }))

        .addCase(logoutUser.rejected, (state, action) => {
          state.logoutStatus = "failed";
          state.logoutError =
            action.payload ||
            action.error.message ||
            "Unable to log out. Please try again.";
        })

        .addCase(resetPassword.fulfilled, () => ({
          ...initialState,
          user: null,
          isAuthenticated: false,
          isAuthChecked: true,
        }));
  },
});

export const {
  clearAuthError,
  clearAuthMessage,
  clearAuthFeedback,
  updateProfileLocally,
  clearProfileFeedback,
  clearPasswordFeedback,
  clearEmailVerificationFeedback,
  clearMobileVerificationFeedback,
  clearLogoutError,
} = authSlice.actions;

export default authSlice.reducer;