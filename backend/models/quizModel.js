import mongoose, { trusted } from "mongoose";

const optionsSchema = new mongoose.Schema({
    label: {
      type: String,
      required: true,
      trim: true,
    },

    tag: {
      type: String,
      enum: ["high_interest", "medium_interest", "low_interest", "neutral"],
      default: "neutral",
    },

    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
},
{_id: true}
)


const questionSchema = new mongoose.Schema({
    questionText:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    questionType:{
        type: String,
        enum: ["singleChoice","multipleChoice","text"],
        default: "singleChoice",
        required: true
    },
    options:{
        type: [optionsSchema],
        default: []
    },
    isRequired: {
        type: Boolean,
        default: true,
    },
    isScored: {
        type: Boolean,
        required: true
    },
    maxScore: {
        type: Number,
        default: 0,
        min: 0,
    },
    order:{
        type: Number,
        required: true,
        min: 0
    }
},
{ _id: true}
);



const quizSchema = new mongoose.Schema({
    key:{
        type: String,
        enum: ["main"],
        default: "main",
        required: true,
        immutable: true
    },
    title:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    quizDescription:{
        type: String,
        trim: true,
        default: ""
    },
    version: {
        type: Number,
        default: 1,
        min: 1,
        required: true,
        validate: Number.isInteger
    },
    questions:{
        type: [questionSchema],
        default: []
    },
    scoringRules: {
        veryGoodMinPercentage: {
            type: Number,
            default: 75,
            min: 0,
            max: 100,
        },

        goodMinPercentage: {
            type: Number,
            default: 40,
            min: 0,
            max: 100,
        },
    },
    isActive: {
        type: Boolean,
        default: false,
    }
},
{
    timestamps: true
});



quizSchema.index({ key: 1 }, { unique: true });

quizSchema.pre("validate", function () {
  const rules = this.scoringRules;

  if (rules.goodMinPercentage >= rules.veryGoodMinPercentage) {
    this.invalidate(
      "scoringRules.goodMinPercentage",
      "Good threshold must be lower than the Very Good threshold."
    );
  }

  if (this.isActive && this.questions.length === 0) {
    this.invalidate("questions", "An active quiz needs at least one question.");
  }

  const orders = new Set();

  this.questions.forEach((question, index) => {
    const path = `questions.${index}`;

    if (orders.has(question.order)) {
      this.invalidate(`${path}.order`, "Question order must be unique.");
    }

    orders.add(question.order);

    if (question.questionType === "text") {
      if (question.options.length > 0) {
        this.invalidate(`${path}.options`, "Text questions cannot have options.");
      }

      if (question.isScored || question.maxScore !== 0) {
        this.invalidate(
          `${path}.isScored`,
          "Text questions must be unscored with maxScore set to 0."
        );
      }

      return;
    }

    if (question.options.length < 2) {
      this.invalidate(
        `${path}.options`,
        "Choice questions need at least two options."
      );
    }

    if (!question.isScored) {
      if (
        question.maxScore !== 0 ||
        question.options.some((option) => option.score !== 0)
      ) {
        this.invalidate(
          `${path}.maxScore`,
          "Unscored questions must have maxScore and option scores set to 0."
        );
      }

      return;
    }

    const optionScores = question.options.map((option) => option.score);

    const attainableScore =
      question.questionType === "singleChoice"
        ? Math.max(0, ...optionScores)
        : optionScores.reduce((sum, score) => sum + score, 0);

    if (
      question.maxScore <= 0 ||
      question.maxScore > attainableScore ||
      question.options.some((option) => option.score > question.maxScore)
    ) {
      this.invalidate(
        `${path}.maxScore`,
        "Set a positive, attainable maxScore that is at least every option score."
      );
    }

    if (
      question.questionType === "singleChoice" &&
      question.maxScore !== attainableScore
    ) {
      this.invalidate(
        `${path}.maxScore`,
        "For singleChoice, maxScore must equal the highest option score."
      );
    }
  });
});



const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;