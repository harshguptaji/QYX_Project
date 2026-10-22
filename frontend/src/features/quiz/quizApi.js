import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/quiz"
    : "http://localhost:5000/api/quiz",

  withCredentials: true,
});

export const getPublicQuizAPI = async (signal) => {
  const response = await api.get("/", { signal });
  const data = response.data;

  if (!data?.success || !data.quiz) {
    throw new Error(data?.message || "Unable to load the quiz.");
  }

  return data;
};

export const submitQuizResponseAPI = async (fields) => {
  const response = await api.post("/responses", fields);
  const data = response.data;

  if (!data?.success || !data.responseId) {
    throw new Error(
      data?.message || "Unable to submit your response."
    );
  }

  return data;
};