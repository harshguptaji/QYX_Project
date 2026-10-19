import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/accios"
    : "http://localhost:5000/api/accios",

  withCredentials: true,
});

const validateResponse = (data) => {
  if (!data?.success || !data.user) {
    throw new Error(
      data?.message || "Unable to process this request."
    );
  }

  return data;
};

export const getAdminUserDetailsAPI = async (userId, signal) => {
  const response = await api.get(
    `/users/${encodeURIComponent(userId)}`,
    { signal }
  );

  return validateResponse(response.data);
};

export const updateAdminUserAPI = async (userId, fields) => {
  const response = await api.patch(
    `/users/${encodeURIComponent(userId)}`,
    fields
  );

  return validateResponse(response.data);
};