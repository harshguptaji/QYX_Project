import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    userEmail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    userMobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },

    userPassword: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    userRole: {
      type: String,
      enum: ["User", "Admin", "Doctor"],
      default: "User",
      required: true,
    },

    userCity: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    userDOB: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    userPhoto: {
        type: String 
    },

    userGender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    userVerified: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function(){
    if(this.isNew || this.isModified("userPassword")){
        const salt = await bcrypt.genSalt(10);
        this.userPassword = await bcrypt.hash(this.userPassword, salt);
    }

    // if email and mobile update
    if(this.isModified("userEmail")){
        this.emailVerified = false;
    }
    if(this.isModified("userMobile")){
        this.mobileVerified = false;
    }
})

const User = mongoose.model("User", userSchema);
export default User;