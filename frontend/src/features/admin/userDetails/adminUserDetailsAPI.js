import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/user"
    : "http://localhost:5000/api/user",

  withCredentials: true,
});

const validateResponse = (data) => {
  if (!data?.success || !data.user) {
    throw new Error(data?.message || "Unable to process this request.");
  }

  return data;
};

export const getAdminUserDetailsAPI = async (userId, signal) => {
  const response = await api.get(
    `/${encodeURIComponent(userId)}`,
    { signal }
  );

  return validateResponse(response.data);
};

export const updateAdminUserAPI = async (userId, fields) => {
  const response = await api.patch(
    `/edit/${encodeURIComponent(userId)}`,
    fields
  );

  return validateResponse(response.data);
};