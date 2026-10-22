import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/accios"
    : "http://localhost:5000/api/accios",

  withCredentials: true,
});

const validateListResponse = (data) => {
  if (
    !data?.success ||
    !Array.isArray(data.responses) ||
    !data.pagination
  ) {
    throw new Error(
      data?.message || "Unable to fetch quiz responses."
    );
  }

  return data;
};

const validateDetailsResponse = (data) => {
  if (!data?.success || !data.response) {
    throw new Error(
      data?.message || "Unable to fetch response details."
    );
  }

  return data;
};

// List, search, filter and paginate responses.
export const getAdminQuizResponsesAPI = async (
  {
    search = "",
    leadCategory = "",
    purposeOfVisiting = "",
    page = 1,
    limit = 10,
  } = {},
  signal
) => {
  const response = await api.get("/quiz/responses", {
    params: {
      search,
      leadCategory,
      purposeOfVisiting,
      page,
      limit,
    },
    signal,
  });

  return validateListResponse(response.data);
};

// Get one submission with saved question and option snapshots.
export const getAdminQuizResponseDetailsAPI = async (
  responseId,
  signal
) => {
  const response = await api.get(
    `/quiz/responses/${encodeURIComponent(responseId)}`,
    { signal }
  );

  return validateDetailsResponse(response.data);
};