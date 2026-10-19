import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/admin/"
    : "http://localhost:5000/api/accios/",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export const adminLoginAPI = async ({
  adminEmail,
  adminPassword,
}) => {
  const response = await adminApi.post("/login", {
    adminEmail,
    adminPassword,
  });

  if (!response.data?.success || !response.data.admin) {
    throw new Error(
      response.data?.message || "Unable to log in."
    );
  }

  return response.data;
};

export const getCurrentAdminAPI = async (signal) => {
  const response = await adminApi.get("/me", {
    signal,
  });

  if (!response.data?.success || !response.data.admin) {
    throw new Error(
      response.data?.message || "Unable to load admin information."
    );
  }

  return response.data;
};

export const adminLogoutAPI = async () => {
  const response = await adminApi.post("/logout");

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Unable to log out."
    );
  }

  return response.data;
};

export default adminApi;