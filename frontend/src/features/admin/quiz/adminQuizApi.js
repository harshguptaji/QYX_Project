import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api/accios"
    : "http://localhost:5000/api/accios",

  withCredentials: true,
});

const validateResponse = (data) => {
  if (!data?.success || !data.quiz) {
    throw new Error(
      data?.message || "Unable to process this request."
    );
  }

  return data;
};

// Get quiz details.
export const getAdminQuizApi = async (signal) => {
  const response = await api.get("/quiz", { signal });

  return validateResponse(response.data);
};

// Create the single quiz.
export const createQuizApi = async (fields) => {
  const response = await api.post("/quiz", fields);

  return validateResponse(response.data);
};

// Update quiz settings.
export const updateQuizApi = async (fields) => {
  const response = await api.patch("/quiz", fields);

  return validateResponse(response.data);
};

// Add a question.
export const addQuestionApi = async (fields) => {
  const response = await api.post("/quiz/questions", fields);

  return validateResponse(response.data);
};

// Update a question.
export const updateQuestionApi = async ({
  questionId,
  ...fields
}) => {
  const response = await api.patch(
    `/quiz/questions/${encodeURIComponent(questionId)}`,
    fields
  );

  return validateResponse(response.data);
};

// Delete a question.
export const deleteQuestionApi = async ({
  questionId,
  version,
}) => {
  const response = await api.delete(
    `/quiz/questions/${encodeURIComponent(questionId)}`,
    {
      data: { version },
    }
  );

  return validateResponse(response.data);
};

// Reorder questions.
export const reorderQuestionsApi = async (fields) => {
  const response = await api.patch(
    "/quiz/questions/reorder",
    fields
  );

  return validateResponse(response.data);
};