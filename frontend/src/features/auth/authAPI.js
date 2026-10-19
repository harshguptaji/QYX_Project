import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/user"
    : "http://localhost:5000/api/user",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUserAPI = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

export const loginUserAPI = async (userData) => {
  const response = await api.post("/login", userData);
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateUserProfileAPI = async (userData) => {
  const response = await api.patch("/edit", userData);
  return response.data;
};

export const changePasswordAPI = async (passwordData) => {
  const response = await api.patch("/edit/password", passwordData);
  return response.data;
};

export const sendEmailVerificationOtpAPI = async () => {
  const response = await api.post("/email");
  return response.data;
};

export const verifyEmailOtpAPI = async (otp) => {
  const response = await api.post("/email/verified", { otp });
  return response.data;
};

export const sendMobileVerificationOtpAPI = async () => {
  const response = await api.post("/mobile");
  return response.data;
};

export const verifyMobileOtpAPI = async (otp) => {
  const response = await api.post("/mobile/verified", { otp });
  return response.data;
};

export const logoutUserAPI = async () => {
  const response = await api.post("/logout");

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Unable to log out."
    );
  }

  return response.data;
};

export const forgotPasswordAPI = async (userEmail) => {
  const response = await api.post("/forgot", {
    userEmail,
  });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Unable to send OTP."
    );
  }

  return response.data;
};

export const resetPasswordAPI = async ({
  userEmail,
  otp,
  newPassword,
}) => {
  const response = await api.post("/forgot/password", {
    userEmail,
    otp,
    newPassword,
  });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Unable to reset password."
    );
  }

  return response.data;
};

export default api;