import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";

const hasOwn = (object, field) =>
  Object.prototype.hasOwnProperty.call(object, field);

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const sendError = (res, status, message) =>
  res.status(status).json({
    message,
    success: false,
  });

const handleError = (res, error) => {
  if (error.code === 11000) {
    return sendError(res, 409, "A quiz already exists.");
  }

  if (error.name === "VersionError") {
    return sendError(
      res,
      409,
      "The quiz changed while you were editing. Reload and try again."
    );
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Quiz validation failed.",
      success: false,
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.name === "CastError") {
    return sendError(res, 400, "Invalid field value or ID.");
  }

  console.error("Quiz controller error:", error);

  return sendError(res, 500, "Something went wrong. Please try again.");
};

// Copy only fields that admins are allowed to change.
const pickFields = (source, fields) => {
  const result = {};

  for (const field of fields) {
    if (hasOwn(source, field)) {
      result[field] = source[field];
    }
  }

  return result;
};

const QUESTION_FIELDS = [
  "questionText",
  "questionType",
  "isRequired",
  "isScored",
  "maxScore",
];

const OPTION_FIELDS = ["label", "tag", "score"];

// All question operations use their own endpoints.
// Quiz-level updates do not replace the questions array.
const QUIZ_FIELDS = ["title", "description", "isActive"];

// Validate an options array before assigning it.
// Existing option IDs are preserved; new options receive new IDs.
const prepareOptions = (options, existingOptions = []) => {
  if (!Array.isArray(options)) {
    return { error: "Options must be an array." };
  }

  const existingIds = new Set(
    existingOptions.map((option) => String(option._id))
  );

  const seenIds = new Set();
  const prepared = [];

  for (const option of options) {
    if (!isObject(option)) {
      return { error: "Each option must be an object." };
    }

    const cleanOption = pickFields(option, OPTION_FIELDS);

    if (hasOwn(option, "_id")) {
      if (!mongoose.isObjectIdOrHexString(option._id)) {
        return { error: "Invalid option ID." };
      }

      const optionId = String(option._id);

      if (!existingIds.has(optionId)) {
        return {
          error: "An option ID does not belong to this question.",
        };
      }

      if (seenIds.has(optionId)) {
        return { error: "Duplicate option IDs are not allowed." };
      }

      seenIds.add(optionId);
      cleanOption._id = option._id;
    }

    prepared.push(cleanOption);
  }

  return { options: prepared };
};

// Keep question order consecutive: 0, 1, 2...
const normalizeOrder = (quiz) => {
  quiz.questions.sort((a, b) => a.order - b.order);

  quiz.questions.forEach((question, index) => {
    question.order = index;
  });
};

// Load quiz and check the version submitted by the admin.
const loadQuizForUpdate = async (req, res) => {
  if (!isObject(req.body)) {
    sendError(res, 400, "Please provide a valid request body.");
    return null;
  }

  if (!Number.isInteger(req.body.version) || req.body.version < 1) {
    sendError(res, 400, "Please provide the current quiz version.");
    return null;
  }

  const quiz = await Quiz.findOne({ key: "main" });

  if (!quiz) {
    sendError(res, 404, "Quiz not found.");
    return null;
  }

  if (quiz.version !== req.body.version) {
    sendError(
      res,
      409,
      "The quiz has changed. Reload it before making changes."
    );
    return null;
  }

  return quiz;
};

// Every successful change gets a new quiz version.
const saveQuiz = async (quiz, res, message) => {
  quiz.version += 1;

  // Runs schema validation and optimistic concurrency checking.
  await quiz.save();

  return res.status(200).json({
    message,
    success: true,
    quiz,
  });
};

// POST /api/quiz/admin
export const createQuiz = async (req, res) => {
  try {
    if (!isObject(req.body)) {
      return sendError(res, 400, "Please provide a valid request body.");
    }

    const exists = await Quiz.exists({ key: "main" });

    if (exists) {
      return sendError(
        res,
        409,
        "A quiz already exists. Update the existing quiz."
      );
    }

    const body = req.body;
    const questions = [];

    if (hasOwn(body, "questions")) {
      if (!Array.isArray(body.questions)) {
        return sendError(res, 400, "Questions must be an array.");
      }

      for (const [index, question] of body.questions.entries()) {
        if (!isObject(question)) {
          return sendError(res, 400, "Each question must be an object.");
        }

        const prepared = prepareOptions(question.options ?? []);

        if (prepared.error) {
          return sendError(res, 400, prepared.error);
        }

        questions.push({
          ...pickFields(question, QUESTION_FIELDS),
          options: prepared.options,
          order: index,
        });
      }
    }

    if (
      hasOwn(body, "isActive") &&
      typeof body.isActive !== "boolean"
    ) {
      return sendError(res, 400, "isActive must be true or false.");
    }

    if (
      hasOwn(body, "scoringRules") &&
      !isObject(body.scoringRules)
    ) {
      return sendError(res, 400, "Scoring rules must be an object.");
    }

    const quiz = new Quiz({
      key: "main",
      version: 1,
      ...pickFields(body, QUIZ_FIELDS),
      questions,
      ...(hasOwn(body, "scoringRules")
        ? {
            scoringRules: pickFields(body.scoringRules, [
              "veryGoodMinPercentage",
              "goodMinPercentage",
            ]),
          }
        : {}),
    });

    await quiz.save();

    return res.status(201).json({
      message: "Quiz created successfully.",
      success: true,
      quiz,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/quiz/admin
export const getAdminQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ key: "main" }).lean();

    if (!quiz) {
      return sendError(res, 404, "Quiz not found.");
    }

    quiz.questions.sort((a, b) => a.order - b.order);

    return res.status(200).json({
      message: "Quiz fetched successfully.",
      success: true,
      quiz,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/quiz
export const getPublicQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      key: "main",
      isActive: true,
    }).lean();

    if (!quiz) {
      return sendError(res, 404, "Quiz is currently unavailable.");
    }

    const questions = [...quiz.questions]
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        _id: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        isRequired: question.isRequired,
        order: question.order,
        options: question.options.map((option) => ({
          _id: option._id,
          label: option.label,
        })),
      }));

    return res.status(200).json({
      message: "Quiz fetched successfully.",
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        version: quiz.version,
        questions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/quiz/admin
// Updates title, description, scoring thresholds and active status.
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await loadQuizForUpdate(req, res);

    if (!quiz) return;

    const body = req.body;

    if (hasOwn(body, "questions")) {
      return sendError(
        res,
        400,
        "Use the question endpoints to add, edit or delete questions."
      );
    }

    const updates = pickFields(body, QUIZ_FIELDS);
    let hasUpdates = Object.keys(updates).length > 0;

    if (
      hasOwn(body, "isActive") &&
      typeof body.isActive !== "boolean"
    ) {
      return sendError(res, 400, "isActive must be true or false.");
    }

    if (hasOwn(body, "scoringRules")) {
      if (!isObject(body.scoringRules)) {
        return sendError(res, 400, "Scoring rules must be an object.");
      }

      const rules = pickFields(body.scoringRules, [
        "veryGoodMinPercentage",
        "goodMinPercentage",
      ]);

      for (const [field, value] of Object.entries(rules)) {
        quiz.scoringRules[field] = value;
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      return sendError(res, 400, "Provide at least one field to update.");
    }

    for (const [field, value] of Object.entries(updates)) {
      quiz[field] = value;
    }

    return await saveQuiz(quiz, res, "Quiz updated successfully.");
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/quiz/admin/questions
// Adds a question at the end of the quiz.
export const addQuestion = async (req, res) => {
  try {
    const quiz = await loadQuizForUpdate(req, res);

    if (!quiz) return;

    const prepared = prepareOptions(req.body.options ?? []);

    if (prepared.error) {
      return sendError(res, 400, prepared.error);
    }

    normalizeOrder(quiz);

    quiz.questions.push({
      ...pickFields(req.body, QUESTION_FIELDS),
      options: prepared.options,
      order: quiz.questions.length,
    });

    return await saveQuiz(quiz, res, "Question added successfully.");
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/quiz/admin/questions/:questionId
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.isObjectIdOrHexString(questionId)) {
      return sendError(res, 400, "Invalid question ID.");
    }

    const quiz = await loadQuizForUpdate(req, res);

    if (!quiz) return;

    const question = quiz.questions.id(questionId);

    if (!question) {
      return sendError(res, 404, "Question not found.");
    }

    const updates = pickFields(req.body, QUESTION_FIELDS);
    const hasOptions = hasOwn(req.body, "options");

    if (Object.keys(updates).length === 0 && !hasOptions) {
      return sendError(res, 400, "Provide at least one field to update.");
    }

    if (hasOptions) {
      const prepared = prepareOptions(
        req.body.options,
        question.options
      );

      if (prepared.error) {
        return sendError(res, 400, prepared.error);
      }

      // Replaces this question's complete options list.
      question.options = prepared.options;
    }

    for (const [field, value] of Object.entries(updates)) {
      question[field] = value;
    }

    return await saveQuiz(quiz, res, "Question updated successfully.");
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /api/quiz/admin/questions/:questionId
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.isObjectIdOrHexString(questionId)) {
      return sendError(res, 400, "Invalid question ID.");
    }

    const quiz = await loadQuizForUpdate(req, res);

    if (!quiz) return;

    const question = quiz.questions.id(questionId);

    if (!question) {
      return sendError(res, 404, "Question not found.");
    }

    if (quiz.isActive && quiz.questions.length === 1) {
      return sendError(
        res,
        400,
        "Deactivate the quiz before deleting its last question."
      );
    }

    quiz.questions.pull(questionId);
    normalizeOrder(quiz);

    return await saveQuiz(quiz, res, "Question deleted successfully.");
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/quiz/admin/questions/reorder
export const reorderQuestions = async (req, res) => {
  try {
    const quiz = await loadQuizForUpdate(req, res);

    if (!quiz) return;

    const { questionIds } = req.body;

    if (
      !Array.isArray(questionIds) ||
      questionIds.length !== quiz.questions.length
    ) {
      return sendError(
        res,
        400,
        "Provide every question ID in the desired order."
      );
    }

    if (
      questionIds.some(
        (id) => !mongoose.isObjectIdOrHexString(id)
      )
    ) {
      return sendError(res, 400, "Invalid question ID.");
    }

    const ids = questionIds.map(String);
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      return sendError(res, 400, "Duplicate question IDs are not allowed.");
    }

    const existingIds = new Set(
      quiz.questions.map((question) => String(question._id))
    );

    if (ids.some((id) => !existingIds.has(id))) {
      return sendError(
        res,
        400,
        "One or more questions do not belong to this quiz."
      );
    }

    const positions = new Map(
      ids.map((id, index) => [id, index])
    );

    quiz.questions.forEach((question) => {
      question.order = positions.get(String(question._id));
    });

    normalizeOrder(quiz);

    return await saveQuiz(quiz, res, "Questions reordered successfully.");
  } catch (error) {
    return handleError(res, error);
  }
};