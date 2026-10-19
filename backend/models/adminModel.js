import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },

    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    adminMobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    adminPassword: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    adminRole: {
      type: String,
      enum: ["Root", "Admin", "Sub-Admin"],
      default: "Sub-Admin",
    },

    passwordChangeAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("adminPassword")) return;

  this.adminPassword = await bcrypt.hash(this.adminPassword, 12);

  if (!this.isNew) {
    this.passwordChangeAt = new Date();
  }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;