import mongoose from "mongoose";

export const CAREER_STATUSES = [
  "new",
  "reviewing",
  "shortlisted",
  "contacted",
  "hired",
  "rejected",
];

const careerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    interest: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    experience: {
      type: String,
      enum: [
        "",
        "Student / Fresher",
        "Less than 1 year",
        "1–3 years",
        "3–5 years",
        "5+ years",
      ],
      default: "",
    },

    profileUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;

          try {
            return ["http:", "https:"].includes(
              new URL(value).protocol
            );
          } catch {
            return false;
          }
        },
        message: "Enter a valid HTTP or HTTPS profile URL.",
      },
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2500,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    status: {
      type: String,
      enum: CAREER_STATUSES,
      default: "new",
    },

    // Internal admin information; never returned by public submission.
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

careerApplicationSchema.index({ createdAt: -1, _id: -1 });

careerApplicationSchema.index({
  status: 1,
  createdAt: -1,
  _id: -1,
});

careerApplicationSchema.index({
  isRead: 1,
  createdAt: -1,
  _id: -1,
});

const CareerApplication = mongoose.model(
  "CareerApplication",
  careerApplicationSchema
);

export default CareerApplication;