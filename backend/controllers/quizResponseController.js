import mongoose from "mongoose";

import Quiz from "../models/quizModel.js";
import QuizResponse from "../models/quizResponseModel.js";

const PURPOSES = [
  "book_consultation",
  "fertility_testing",
  "general_information",
  "follow_up_support",
  "other",
];

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isValidId = (value) =>
  typeof value === "string" &&
  mongoose.isObjectIdOrHexString(value);

const fail = (res, status, message) =>
  res.status(status).json({
    message,
    success: false,
  });

export const submitQuizResponse = async (req, res) => {
  try {
    if (!isObject(req.body)) {
      return fail(res, 400, "Please provide a valid request body.");
    }

    const {
      quizVersion,
      answers,
      email,
      mobile,
      purposeOfVisiting,
      otherPurpose = "",
      contactConsent = false,
    } = req.body;

    // 1. Validate the submitted version and answers array.
    if (!Number.isInteger(quizVersion) || quizVersion < 1) {
      return fail(res, 400, "Invalid quiz version.");
    }

    if (!Array.isArray(answers)) {
      return fail(res, 400, "Answers must be an array.");
    }

    // 2. Validate final-step contact details.
    if (
      typeof email !== "string" ||
      typeof mobile !== "string" ||
      typeof purposeOfVisiting !== "string" ||
      typeof otherPurpose !== "string"
    ) {
      return fail(
        res,
        400,
        "Email, mobile and purpose fields must be strings."
      );
    }

    if (typeof contactConsent !== "boolean") {
      return fail(res, 400, "Contact consent must be true or false.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const rawMobile = mobile.trim();
    const cleanMobile = rawMobile.replace(/[\s()-]/g, "");
    const cleanOtherPurpose = otherPurpose.trim();

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return fail(res, 400, "Please enter a valid email address.");
    }

    if (
      !/^\+[\d\s()-]+$/.test(rawMobile) ||
      !/^\+[1-9]\d{7,14}$/.test(cleanMobile)
    ) {
      return fail(
        res,
        400,
        "Enter a phone number with country code, for example +919876543210."
      );
    }

    if (!PURPOSES.includes(purposeOfVisiting)) {
      return fail(res, 400, "Please select a valid purpose of visiting.");
    }

    if (
      purposeOfVisiting === "other" &&
      !cleanOtherPurpose
    ) {
      return fail(res, 400, "Please describe your purpose of visiting.");
    }

    if (cleanOtherPurpose.length > 1000) {
      return fail(
        res,
        400,
        "Other purpose cannot exceed 1000 characters."
      );
    }

    // 3. Fetch the active quiz.
    const quiz = await Quiz.findOne({
      key: "main",
      isActive: true,
    }).lean();

    if (!quiz) {
      return fail(res, 404, "Quiz is currently unavailable.");
    }

    if (quiz.version !== quizVersion) {
      return fail(
        res,
        409,
        "The quiz has changed. Restart with the updated questions."
      );
    }

    if (answers.length > quiz.questions.length) {
      return fail(res, 400, "Too many question answers were submitted.");
    }

    // 4. Validate question IDs and prevent duplicate answers.
    const questionMap = new Map(
      quiz.questions.map((question) => [
        String(question._id),
        question,
      ])
    );

    const answerMap = new Map();

    for (const answer of answers) {
      if (!isObject(answer) || !isValidId(answer.questionId)) {
        return fail(
          res,
          400,
          "Each answer must contain a valid question ID."
        );
      }

      const questionId = answer.questionId.toLowerCase();

      if (!questionMap.has(questionId)) {
        return fail(
          res,
          400,
          "A submitted question does not belong to this quiz."
        );
      }

      if (answerMap.has(questionId)) {
        return fail(res, 400, "Duplicate question answers are not allowed.");
      }

      answerMap.set(questionId, answer);
    }

    const savedAnswers = [];

    let totalScore = 0;
    let maximumPossibleScore = 0;
    let answeredCount = 0;

    const questions = [...quiz.questions].sort(
      (a, b) => a.order - b.order
    );

    // 5. Check every question, including skipped optional ones.
    for (const question of questions) {
      const submitted = answerMap.get(String(question._id));

      const selectedOptionIds =
        submitted?.selectedOptionIds === undefined
          ? []
          : submitted.selectedOptionIds;

      const textAnswer =
        submitted?.textAnswer === undefined
          ? ""
          : submitted.textAnswer;

      if (!Array.isArray(selectedOptionIds)) {
        return fail(
          res,
          400,
          "Selected option IDs must be an array."
        );
      }

      if (typeof textAnswer !== "string") {
        return fail(res, 400, "Text answers must be strings.");
      }

      const cleanText = textAnswer.trim();

      if (cleanText.length > 5000) {
        return fail(
          res,
          400,
          "Text answers cannot exceed 5000 characters."
        );
      }

      const selectedOptions = [];

      let answered = false;
      let earnedScore = 0;

      if (question.questionType === "text") {
        if (selectedOptionIds.length > 0) {
          return fail(
            res,
            400,
            "Text questions cannot contain selected options."
          );
        }

        answered = cleanText.length > 0;
      } else {
        if (cleanText.length > 0) {
          return fail(
            res,
            400,
            "Choice questions cannot contain text answers."
          );
        }

        if (
          question.questionType === "singleChoice" &&
          selectedOptionIds.length > 1
        ) {
          return fail(
            res,
            400,
            "Select only one option for single-choice questions."
          );
        }

        if (selectedOptionIds.length > question.options.length) {
          return fail(res, 400, "Too many options were selected.");
        }

        const optionMap = new Map(
          question.options.map((option) => [
            String(option._id),
            option,
          ])
        );

        const seenOptionIds = new Set();

        for (const optionId of selectedOptionIds) {
          if (!isValidId(optionId)) {
            return fail(res, 400, "Invalid selected option ID.");
          }

          const normalizedId = optionId.toLowerCase();

          if (seenOptionIds.has(normalizedId)) {
            return fail(
              res,
              400,
              "Duplicate selected options are not allowed."
            );
          }

          seenOptionIds.add(normalizedId);

          const option = optionMap.get(normalizedId);

          if (!option) {
            return fail(
              res,
              400,
              "A selected option does not belong to its question."
            );
          }

          // Trusted snapshots come from MongoDB.
          selectedOptions.push({
            optionId: option._id,
            labelSnapshot: option.label,
            tagSnapshot: option.tag,
            scoreSnapshot: option.score,
          });
        }

        answered = selectedOptions.length > 0;

        if (question.isScored) {
          const selectedScore = selectedOptions.reduce(
            (sum, option) => sum + option.scoreSnapshot,
            0
          );

          earnedScore = Math.min(
            selectedScore,
            question.maxScore
          );
        }
      }

      if (question.isRequired && !answered) {
        return fail(
          res,
          400,
          `Please answer: ${question.questionText}`
        );
      }

      if (answered) {
        answeredCount += 1;
      }

      const maxScore = question.isScored
        ? question.maxScore
        : 0;

      totalScore += earnedScore;
      maximumPossibleScore += maxScore;

      savedAnswers.push({
        questionId: question._id,
        questionTextSnapshot: question.questionText,
        questionTypeSnapshot: question.questionType,
        isRequiredSnapshot: question.isRequired,
        isScoredSnapshot: question.isScored,
        answered,
        selectedOptions,
        textAnswer: cleanText,
        earnedScore,
        maxScoreSnapshot: maxScore,
      });
    }

    if (answeredCount === 0) {
      return fail(
        res,
        400,
        "Please answer at least one quiz question."
      );
    }

    // 6. Calculate lead classification.
    const {
      veryGoodMinPercentage,
      goodMinPercentage,
    } = quiz.scoringRules;

    let scorePercentage = null;
    let leadCategory = "unscored";

    if (maximumPossibleScore > 0) {
      scorePercentage =
        (totalScore / maximumPossibleScore) * 100;

      if (scorePercentage >= veryGoodMinPercentage) {
        leadCategory = "very_good";
      } else if (scorePercentage >= goodMinPercentage) {
        leadCategory = "good";
      } else {
        leadCategory = "low_interest";
      }
    }

    // Detect quiz edits that happened during answer processing.
    const stillCurrent = await Quiz.exists({
      _id: quiz._id,
      version: quiz.version,
      isActive: true,
    });

    if (!stillCurrent) {
      return fail(
        res,
        409,
        "The quiz has changed. Restart with the updated questions."
      );
    }

    // 7. Save answers, contact details and internal analysis.
    const response = await QuizResponse.create({
      quizId: quiz._id,
      quizTitleSnapshot: quiz.title,
      quizVersion: quiz.version,

      // Populated only by trusted user authentication middleware.
      userId: req.user?._id ?? null,

      answers: savedAnswers,

      email: cleanEmail,
      mobile: cleanMobile,
      purposeOfVisiting,

      otherPurpose:
        purposeOfVisiting === "other"
          ? cleanOtherPurpose
          : "",

      contactConsent,
      contactConsentAt: contactConsent ? new Date() : null,

      analysis: {
        totalScore,
        maximumPossibleScore,
        scorePercentage,
        leadCategory,

        scoringRulesSnapshot: {
          veryGoodMinPercentage,
          goodMinPercentage,
        },
      },
    });

    // Matches the response expected by quizApi.js.
    return res.status(201).json({
      message: "Your quiz response has been submitted successfully.",
      success: true,
      responseId: response._id,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your submission.",
        success: false,
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    if (error.name === "CastError") {
      return fail(res, 400, "Invalid field value.");
    }

    console.error("Submit quiz response error:", error);

    return fail(
      res,
      500,
      "Unable to submit your response. Please try again."
    );
  }
};

// QuizResponse and mongoose are already imported at the top.

// Escape special characters so search text is treated literally.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LEAD_CATEGORIES = [
  "very_good",
  "good",
  "low_interest",
  "unscored",
];

// GET /api/accios/quiz/responses
export const getAllQuizResponses = async (req, res) => {
  try {
    const {
      search = "",
      leadCategory = "",
      purposeOfVisiting = "",
      page = "1",
      limit = "10",
    } = req.query;

    // Reject arrays and objects in query parameters.
    const queryValues = [
      search,
      leadCategory,
      purposeOfVisiting,
      page,
      limit,
    ];

    if (queryValues.some((value) => typeof value !== "string")) {
      return fail(res, 400, "Invalid query parameters.");
    }

    if (
      !/^[1-9]\d*$/.test(page) ||
      !/^[1-9]\d*$/.test(limit)
    ) {
      return fail(
        res,
        400,
        "Page and limit must be positive integers."
      );
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isSafeInteger(pageNumber) ||
      !Number.isSafeInteger(limitNumber) ||
      limitNumber > 100
    ) {
      return fail(
        res,
        400,
        "Invalid pagination. Limit cannot exceed 100."
      );
    }

    const skip = (pageNumber - 1) * limitNumber;

    if (!Number.isSafeInteger(skip)) {
      return fail(res, 400, "Page number is too large.");
    }

    const searchText = search.trim();

    if (searchText.length > 100) {
      return fail(
        res,
        400,
        "Search cannot exceed 100 characters."
      );
    }

    const filter = {};

    // Filter by saved lead classification.
    if (leadCategory) {
      if (!LEAD_CATEGORIES.includes(leadCategory)) {
        return fail(res, 400, "Invalid lead category.");
      }

      filter["analysis.leadCategory"] = leadCategory;
    }

    // PURPOSES is already defined in your existing controller file.
    if (purposeOfVisiting) {
      if (!PURPOSES.includes(purposeOfVisiting)) {
        return fail(res, 400, "Invalid purpose of visiting.");
      }

      filter.purposeOfVisiting = purposeOfVisiting;
    }

    // Search email, phone, other purpose or an exact response ID.
    if (searchText) {
      const searchRegex = new RegExp(
        escapeRegex(searchText),
        "i"
      );

      const searchConditions = [
        { email: searchRegex },
        { mobile: searchRegex },
        { otherPurpose: searchRegex },
      ];

      // Also match formatted numbers against normalized stored numbers.
      const normalizedPhone = searchText.replace(/[\s()-]/g, "");

      if (
        normalizedPhone !== searchText &&
        /^\+?\d+$/.test(normalizedPhone)
      ) {
        searchConditions.push({
          mobile: new RegExp(escapeRegex(normalizedPhone), "i"),
        });
      }

      if (mongoose.isObjectIdOrHexString(searchText)) {
        searchConditions.push({
          _id: new mongoose.Types.ObjectId(searchText),
        });
      }

      filter.$or = searchConditions;
    }

    const [responses, totalResponses] = await Promise.all([
      QuizResponse.find(filter)
        // Exclude answer snapshots from the list payload.
        .select(
          "_id quizId quizTitleSnapshot quizVersion " +
          "email mobile purposeOfVisiting otherPurpose " +
          "contactConsent analysis createdAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      QuizResponse.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalResponses / limitNumber);

    return res.status(200).json({
      message: "Quiz responses fetched successfully.",
      success: true,
      responses,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalResponses,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get quiz responses error:", error);

    return fail(
      res,
      500,
      "Unable to fetch quiz responses."
    );
  }
};

// GET /api/accios/quiz/responses/:responseId
export const getQuizResponseById = async (req, res) => {
  try {
    const { responseId } = req.params;

    if (!mongoose.isObjectIdOrHexString(responseId)) {
      return fail(res, 400, "Invalid response ID.");
    }

    // Read historical snapshots directly.
    // No dependency on the current quiz or its questions.
    const response = await QuizResponse.findById(responseId)
      .select("-__v")
      .lean();

    if (!response) {
      return fail(res, 404, "Quiz response not found.");
    }

    return res.status(200).json({
      message: "Quiz response fetched successfully.",
      success: true,
      response,
    });
  } catch (error) {
    console.error("Get quiz response details error:", error);

    return fail(
      res,
      500,
      "Unable to fetch quiz response details."
    );
  }
};
