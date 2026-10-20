import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/accios"
    : "http://localhost:5000/api/accios",

  withCredentials: true,
});

const validateResponse = (data) => {
  if (data?.success !== true) {
    throw new Error(
      data?.message || "Unable to process this request."
    );
  }

  return data;
};

// Register a new admin
export const registerAdminAPI = async ({
  adminName,
  adminEmail,
  adminMobile,
  adminPassword,
  adminRole = "Sub-Admin",
}) => {
  const response = await api.post("/register", {
    adminName: adminName.trim(),
    adminEmail: adminEmail.trim().toLowerCase(),
    adminMobile: adminMobile.trim(),
    adminPassword,
    adminRole,
  });

  const data = validateResponse(response.data);

  if (!data.admin) {
    throw new Error("Registered admin information is missing.");
  }

  return data;
};

// All admins: backend search, role filter and pagination
export const getAllAdminsAPI = async ({
  page = 1,
  limit = 15,
  search = "",
  role = "all",
  sort = "newest",
  signal,
} = {}) => {
  const response = await api.get("/all", {
    signal,
    params: {
      page,
      limit,
      sort,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(role !== "all" ? { role } : {}),
    },
  });

  const data = validateResponse(response.data);

  if (
    !Array.isArray(data.admins) ||
    !Number.isInteger(data.pagination?.page) ||
    data.pagination.page < 1 ||
    !Number.isInteger(data.pagination?.limit) ||
    data.pagination.limit < 1 ||
    !Number.isInteger(data.pagination?.total) ||
    data.pagination.total < 0 ||
    !Number.isInteger(data.pagination?.totalPages) ||
    data.pagination.totalPages < 1
  ) {
    throw new Error("The server returned an invalid admins response.");
  }

  return data;
};

// View one admin
export const getAdminDetailsAPI = async (adminId, signal) => {
  const response = await api.get(
    `/${encodeURIComponent(adminId)}`,
    { signal }
  );

  const data = validateResponse(response.data);

  if (!data.admin) {
    throw new Error("Admin information is missing.");
  }

  return data;
};

// Edit admin, including optional new password
export const editAdminAPI = async (adminId, fields) => {
  // Explicitly allow only editable fields.
  const payload = {};

  for (const field of [
    "adminName",
    "adminEmail",
    "adminMobile",
    "adminRole",
  ]) {
    if (fields[field] !== undefined) {
      payload[field] = fields[field];
    }
  }

  // An empty password field means keep the existing password.
  if (
    fields.adminPassword !== undefined &&
    fields.adminPassword !== ""
  ) {
    payload.adminPassword = fields.adminPassword;
  }

  const response = await api.patch(
    `/edit/${encodeURIComponent(adminId)}`,
    payload
  );

  const data = validateResponse(response.data);

  if (!data.admin) {
    throw new Error("Updated admin information is missing.");
  }

  return data;
};

// Delete admin: no request body
export const deleteAdminAPI = async (adminId) => {
  const response = await api.delete(
    `/delete/${encodeURIComponent(adminId)}`
  );

  return validateResponse(response.data);
};