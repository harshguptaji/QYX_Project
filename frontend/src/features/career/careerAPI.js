import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api"
    : "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

const validateResponse = (data) => {
  if (data?.success !== true) {
    throw new Error(
      data?.message || "Unable to process the request."
    );
  }

  return data;
};

const validateApplicationResponse = (data) => {
  validateResponse(data);

  if (!data.application?._id) {
    throw new Error(
      "The server returned invalid application information."
    );
  }

  return data;
};

// Public: submit career application
export const submitCareerApplicationAPI = async (fields) => {
  const response = await api.post("/career/register", {
    name: fields.name,
    email: fields.email,
    mobile: fields.mobile,
    interest: fields.interest,
    experience: fields.experience,
    profileUrl: fields.profileUrl,
    message: fields.message,
  });

  return validateResponse(response.data);
};

// Admin: list applications
export const getCareerApplicationsAPI = async ({
  page = 1,
  limit = 15,
  search = "",
  status = "all",
  readStatus = "all",
  experience = "",
  sort = "newest",
  signal,
} = {}) => {
  const response = await api.get("/accios/careers", {
    signal,

    params: {
      page,
      limit,
      status,
      readStatus,
      sort,

      ...(search.trim()
        ? { search: search.trim() }
        : {}),

      ...(experience
        ? { experience }
        : {}),
    },
  });

  const data = validateResponse(response.data);
  const pagination = data.pagination;

  if (
    !Array.isArray(data.applications) ||
    !Number.isInteger(pagination?.page) ||
    pagination.page < 1 ||
    !Number.isInteger(pagination?.limit) ||
    pagination.limit < 1 ||
    !Number.isInteger(pagination?.total) ||
    pagination.total < 0 ||
    !Number.isInteger(pagination?.totalPages) ||
    pagination.totalPages < 1
  ) {
    throw new Error(
      "The server returned an invalid applications response."
    );
  }

  return data;
};

// Admin: dashboard statistics
export const getCareerStatsAPI = async (signal) => {
  const response = await api.get("/accios/careers/stats", {
    signal,
  });

  const data = validateResponse(response.data);

  if (
    !data.stats ||
    !Number.isInteger(data.stats.total) ||
    !Number.isInteger(data.stats.read) ||
    !Number.isInteger(data.stats.unread) ||
    !data.stats.byStatus
  ) {
    throw new Error(
      "The server returned invalid career statistics."
    );
  }

  return data;
};

// Admin: one application
export const getCareerApplicationAPI = async (
  applicationId,
  signal
) => {
  const response = await api.get(
    `/accios/careers/${encodeURIComponent(applicationId)}`,
    { signal }
  );

  return validateApplicationResponse(response.data);
};

// Admin: mark an application read or unread
export const updateCareerReadStatusAPI = async ({
  applicationId,
  isRead,
}) => {
  if (typeof isRead !== "boolean") {
    throw new Error("isRead must be true or false.");
  }

  const action = isRead ? "read" : "unread";

  const response = await api.patch(
    `/accios/careers/${encodeURIComponent(applicationId)}/${action}`
  );

  return validateApplicationResponse(response.data);
};

// Admin: update hiring status and/or internal notes
export const reviewCareerApplicationAPI = async ({
  applicationId,
  status,
  adminNotes,
}) => {
  const fields = {};

  if (status !== undefined) {
    fields.status = status;
  }

  if (adminNotes !== undefined) {
    fields.adminNotes = adminNotes;
  }

  const response = await api.patch(
    `/accios/careers/${encodeURIComponent(applicationId)}/review`,
    fields
  );

  return validateApplicationResponse(response.data);
};