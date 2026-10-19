import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/accios"
    : "http://localhost:5000/api/accios",

  withCredentials: true,
});

export const getAdminUsersAPI = async ({
  page = 1,
  limit = 15,
  search = "",
  role = "all",
  verification = "all",
  signal,
} = {}) => {
  const response = await api.get("/users", {
    signal,
    params: {
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(role !== "all" ? { role } : {}),
      ...(verification !== "all" ? { verification } : {}),
    },
  });

  const result = response.data;

  if (
    result?.success !== true ||
    !Array.isArray(result.users) ||
    !Number.isInteger(result.pagination?.total) ||
    result.pagination.total < 0 ||
    !Number.isInteger(result.pagination?.page) ||
    result.pagination.page < 1 ||
    result.pagination.limit !== limit
  ) {
    throw new Error(
      "The server returned an invalid users response."
    );
  }

  return result;
};