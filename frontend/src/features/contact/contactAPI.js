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
      data?.message || "Unable to process this request."
    );
  }

  return data;
};

// Public: submit contact form
export const submitContactAPI = async (fields) => {
  const response = await api.post("/contact/register", {
    name: fields.name,
    email: fields.email,
    mobile: fields.mobile,
    purpose: fields.purpose,
    message: fields.message,
  });

  return validateResponse(response.data);
};

// Admin: all contacts with backend search and pagination
export const getContactsAPI = async ({
  page = 1,
  limit = 15,
  search = "",
  status = "all",
  purpose = "",
  sort = "newest",
  signal,
} = {}) => {
  const response = await api.get("/accios/contacts", {
    signal,

    params: {
      page,
      limit,
      status,
      sort,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
    },
  });

  const data = validateResponse(response.data);

  if (
    !Array.isArray(data.contacts) ||
    !Number.isInteger(data.pagination?.page) ||
    data.pagination.page < 1 ||
    !Number.isInteger(data.pagination?.limit) ||
    data.pagination.limit < 1 ||
    !Number.isInteger(data.pagination?.total) ||
    data.pagination.total < 0 ||
    !Number.isInteger(data.pagination?.totalPages) ||
    data.pagination.totalPages < 1
  ) {
    throw new Error(
      "The server returned an invalid contacts response."
    );
  }

  return data;
};

// Admin: view full contact message
export const getContactDetailsAPI = async (contactId, signal) => {
  const response = await api.get(
    `/accios/contacts/${encodeURIComponent(contactId)}`,
    { signal }
  );

  const data = validateResponse(response.data);

  if (!data.contact?._id) {
    throw new Error("Contact information is missing.");
  }

  return data;
};

// Admin: mark read or unread
export const updateContactReadStatusAPI = async ({
  contactId,
  isRead,
}) => {
  if (typeof isRead !== "boolean") {
    throw new Error("isRead must be true or false.");
  }

  const action = isRead ? "read" : "unread";

  const response = await api.patch(
    `/accios/contacts/${encodeURIComponent(contactId)}/${action}`
  );

  const data = validateResponse(response.data);

  if (!data.contact?._id) {
    throw new Error("Updated contact information is missing.");
  }

  return data;
};

// Admin: total, read and unread counts
export const getContactStatsAPI = async (signal) => {
  const response = await api.get("/accios/contacts/stats", {
    signal,
  });

  const data = validateResponse(response.data);

  if (
    !["total", "read", "unread"].every(
      (field) =>
        Number.isInteger(data.stats?.[field]) &&
        data.stats[field] >= 0
    )
  ) {
    throw new Error(
      "The server returned invalid contact statistics."
    );
  }

  return data;
};