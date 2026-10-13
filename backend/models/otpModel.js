import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: [
        "EMAIL_VERIFICATION",
        "MOBILE_VERIFICATION",
        "PASSWORD_RESET",
      ],
      required: true,
      index: true,
    },

    channel: {
      type: String,
      enum: ["EMAIL", "MOBILE"],
      required: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helps find the latest OTP quickly
otpSchema.index({
  userId: 1,
  purpose: 1,
  createdAt: -1,
});

// Automatically delete the record when expiresAt is reached
otpSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;