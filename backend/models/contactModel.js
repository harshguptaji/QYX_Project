import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email address is required."],
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Enter a valid email address.",
      ],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required."],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number.",
      ],
    },

    purpose: {
      type: String,
      required: [true, "Purpose of visiting is required."],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      maxlength: 5000,
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
  },
  {
    timestamps: true,
  }
);

// Supports newest-first listing and read/unread filtering.
contactSchema.index({ createdAt: -1, _id: -1 });
contactSchema.index({ isRead: 1, createdAt: -1, _id: -1 });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;