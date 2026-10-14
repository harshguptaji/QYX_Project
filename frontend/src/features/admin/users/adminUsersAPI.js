import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/user"
    : "http://localhost:5000/api/user",

  withCredentials: true,
});



export const getAdminUsersAPI = async ({
  page,
  limit,
  search,
  role,
  verification,
  signal,
}) => {
  const response = await api.get("/users", {
    signal,
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(role !== "all" ? { role } : {}),
      ...(verification !== "all" ? { verification } : {}),
    },
  });

  const result = response.data;

  if (
    result.success !== true ||
    !Array.isArray(result.users) ||
    !Number.isInteger(result.pagination?.total) ||
    result.pagination.total < 0 ||
    !Number.isInteger(result.pagination?.page) ||
    result.pagination.page < 1 ||
    result.pagination.limit !== limit
  ) {
    throw new Error("The server returned an invalid users response.");
  }

  return result;
};