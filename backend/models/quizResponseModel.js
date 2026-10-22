import mongoose from "mongoose";

const selectedOptionSchema = new mongoose.Schema(
  {
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    labelSnapshot: {
      type: String,
      required: true,
    },

    tagSnapshot: {
      type: String,
      enum: [
        "high_interest",
        "medium_interest",
        "low_interest",
        "neutral",
      ],
      required: true,
    },

    scoreSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    questionTextSnapshot: {
      type: String,
      required: true,
    },

    questionTypeSnapshot: {
      type: String,
      enum: ["singleChoice", "multipleChoice", "text"],
      required: true,
    },

    isRequiredSnapshot: {
      type: Boolean,
      required: true,
    },

    isScoredSnapshot: {
      type: Boolean,
      required: true,
    },

    // False for an unanswered optional question.
    answered: {
      type: Boolean,
      required: true,
    },

    selectedOptions: {
      type: [selectedOptionSchema],
      default: [],
    },

    textAnswer: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    earnedScore: {
      type: Number,
      required: true,
      min: 0,
    },

    maxScoreSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const quizResponseSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    quizTitleSnapshot: {
      type: String,
      required: true,
    },

    quizVersion: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quiz version must be an integer.",
      },
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    answers: {
      type: [answerSchema],
      default: [],
      validate: {
        validator: (answers) =>
          answers.length > 0 &&
          answers.some((answer) => answer.answered),
        message: "At least one question must be answered.",
      },
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Enter a valid email address.",
      ],
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\+[1-9]\d{7,14}$/,
        "Enter a phone number with country code.",
      ],
    },

    purposeOfVisiting: {
      type: String,
      required: true,
      enum: [
        "book_consultation",
        "fertility_testing",
        "general_information",
        "follow_up_support",
        "other",
      ],
    },

    otherPurpose: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
      required: function () {
        return this.purposeOfVisiting === "other";
      },
    },

    contactConsent: {
      type: Boolean,
      default: false,
    },

    contactConsentAt: {
      type: Date,
      default: null,
    },

    analysis: {
      totalScore: {
        type: Number,
        required: true,
        min: 0,
      },

      maximumPossibleScore: {
        type: Number,
        required: true,
        min: 0,
      },

      scorePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      leadCategory: {
        type: String,
        enum: [
          "very_good",
          "good",
          "low_interest",
          "unscored",
        ],
        required: true,
      },

      scoringRulesSnapshot: {
        veryGoodMinPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },

        goodMinPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    },
  },
  { timestamps: true }
);

// Admin listing and filtering.
quizResponseSchema.index({ createdAt: -1, _id: -1 });

quizResponseSchema.index({
  "analysis.leadCategory": 1,
  createdAt: -1,
});

quizResponseSchema.index({ email: 1 });

const QuizResponse = mongoose.model(
  "QuizResponse",
  quizResponseSchema
);

export default QuizResponse;