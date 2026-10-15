import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import sendEmail from "../utils/sendEmail.js";
import sendSMS from "../utils/sendSMS.js"
import OTP from "../models/otpModel.js";


const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const OTP_LOCK_MINUTES = 30;
const MAX_OTP_ATTEMPTS = 5;

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

const createOtpError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

/*
 * Common OTP verification function
 */
const verifyAndConsumeOtp = async ({
  userId,
  purpose,
  destination,
  submittedOtp,
}) => {
  const currentTime = new Date();

  const otpRecord = await OTP.findOne({
    userId,
    purpose,
    destination,
  })
    .sort({
      createdAt: -1,
    })
    .select("+otpHash");

  if (!otpRecord) {
    throw createOtpError(
      "Invalid or expired OTP.",
      400
    );
  }

  // Check 15-minute lock
  if (
    otpRecord.lockedUntil &&
    otpRecord.lockedUntil > currentTime
  ) {
    const remainingMinutes = Math.ceil(
      (otpRecord.lockedUntil.getTime() -
        currentTime.getTime()) /
        (60 * 1000)
    );

    throw createOtpError(
      `Maximum OTP attempts exceeded. Please try again after ${remainingMinutes} minute(s).`,
      429
    );
  }

  // Check OTP expiration
  if (otpRecord.expiresAt <= currentTime) {
    throw createOtpError(
      "OTP has expired. Please request a new OTP.",
      400
    );
  }

  const otpMatched = await bcrypt.compare(
    submittedOtp.toString().trim(),
    otpRecord.otpHash
  );

  if (!otpMatched) {
    const newAttemptCount =
      otpRecord.attempts + 1;

    // Lock after fifth incorrect attempt
    if (
      newAttemptCount >=
      MAX_OTP_ATTEMPTS
    ) {
      const lockedUntil = new Date(
        currentTime.getTime() +
          OTP_LOCK_MINUTES *
            60 *
            1000
      );

      otpRecord.attempts =
        newAttemptCount;

      otpRecord.lockedUntil =
        lockedUntil;

      /*
       * Keep the record until the lock ends.
       * The TTL index will delete it.
       */
      otpRecord.expiresAt =
        lockedUntil;

      await otpRecord.save();

      throw createOtpError(
        `Maximum OTP attempts exceeded. Please try again after ${OTP_LOCK_MINUTES} minutes.`,
        429
      );
    }

    otpRecord.attempts =
      newAttemptCount;

    await otpRecord.save();

    const remainingAttempts =
      MAX_OTP_ATTEMPTS -
      newAttemptCount;

    throw createOtpError(
      `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`,
      400
    );
  }

  /*
   * Delete the OTP after successful verification.
   * This prevents the same OTP from being reused.
   */
  const consumedOtp =
    await OTP.findOneAndDelete({
      _id: otpRecord._id,
    });

  if (!consumedOtp) {
    throw createOtpError(
      "OTP has already been used or expired.",
      400
    );
  }

  return true;
};

// Register User
export const userRegister = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userMobile,
      userPassword,
      userCity,
      userDOB,
      userGender,
    } = req.body;

    if (
      !userCity ||
      !userPassword ||
      !userName ||
      !userEmail ||
      !userMobile ||
      !userDOB ||
      !userGender
    ) {
      return res.status(400).json({
        message: "Please fill all required infoemation",
        sucess: true,
      });
    }
    const user = await User.findOne({ $or: [{ userEmail }, { userMobile }] });

    if (user) {
      return res.status(400).json({
        message: "User already register with this email-id or mobile number",
        success: false,
      });
    }
    const registeredUser = new User({
        userName,
        userEmail,
        userMobile,
        userPassword,
        userCity,
        userDOB,
        userGender
    });

    await registeredUser.save();

    return res.status(200).json({
      message: "User Register Successfully",
      success: true,
    });
  } catch (error) {
    console.log(`Controller Error - ${error}`);
  }
};

// Login User
export const userLogin = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        message: "Please fill all required fields",
        success: false,
      });
    }

    const user = await User.findOne({ userEmail }).select("+userPassword");

    if (!user) {
      return res.status(400).json({
        message: "User Not Found By This Email-id",
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(userPassword, user.userPassword);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Password is not correct",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.userRole, verified: user.userVerified },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "3d",
      },
    );

    const isProduction = process.env.NODE_ENV === "production";

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: isProduction ? "none" : "lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   path: "/",
    // });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.userName,
        email: user.userEmail,
        mobile: user.userMobile,
        role: user.userRole,
        dob: user.userDOB ? user.userDOB.toISOString().slice(0, 10) : null,
        gender: user.userGender,
        city: user.userCity,
        status: user.userStatus,
      },
    });
  } catch (error) {
    console.log(`Controller Error - ${error}`);
  }
};

// Log out
export const userLogout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("User logout controller error:", error);

    return res.status(500).json({
      message: "Unable to log out. Please try again.",
      success: false,
    });
  }
};

//MeController
export const userMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,

      user: {
        id: req.user._id,
        userName: req.user.userName,
        userMobile: req.user.userMobile,
        userEmail: req.user.userEmail,
        userVerified: req.user.userVerified,
        mobileVerified: req.user.mobileVerified,
        emailVerified: req.user.emailVerified,
        userDOB: req.user.userDOB?req.user.userDOB.toISOString().slice(0, 10) : null,
        userGender: req.user.userGender,
        userRole: req.user.userRole,
        userCity: req.user.userCity,
        userPhoto: req.user.userPhoto,
      },
    });
  } catch (error) {
    console.log(`Controller Error - ${error}`);
  }
};

// Edit User By Login User
export const userEditByUser = async (req, res) => {
  try {
    const { userName, userEmail, userMobile, userCity, userDOB, userGender } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
        success: false,
      });
    }

    // Find current user
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    const updateData = {};

    if (userName !== undefined) {
      updateData.userName = userName.trim();
    }

    if (userCity !== undefined) {
      updateData.userCity = userCity.trim();
    }

    if (userDOB !== undefined) {
      updateData.userDOB = userDOB;
    }

    if (userGender !== undefined) {
      updateData.userGender = userGender;
    }

    // Update email
    if (userEmail !== undefined) {
      const normalizedEmail = userEmail.trim().toLowerCase();

      if (normalizedEmail !== currentUser.userEmail) {
        const emailExists = await User.exists({
          userEmail: normalizedEmail,
          _id: { $ne: userId },
        });

        if (emailExists) {
          return res.status(409).json({
            message: "Email address is already registered.",
            success: false,
          });
        }

        updateData.userEmail = normalizedEmail;
        updateData.emailVerified = false;
      }
    }

    // Update mobile number
    if (userMobile !== undefined) {
      const normalizedMobile = userMobile.trim();

      if (normalizedMobile !== currentUser.userMobile) {
        const mobileExists = await User.exists({
          userMobile: normalizedMobile,
          _id: { $ne: userId },
        });

        if (mobileExists) {
          return res.status(409).json({
            message: "Mobile number is already registered.",
            success: false,
          });
        }

        updateData.userMobile = normalizedMobile;
        updateData.mobileVerified = false;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Please provide information to update.",
        success: false,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).select("-userPassword");

    return res.status(200).json({
      message: "Profile updated successfully.",
      success: true,
      user: {
        id: updatedUser._id,
        userName: updatedUser.userName,
        userEmail: updatedUser.userEmail,
        userMobile: updatedUser.userMobile,
        userCity: updatedUser.userCity,
        userDOB: updatedUser.userDOB,
        userGender: updatedUser.userGender,
        userRole: updatedUser.userRole,
        emailVerified: updatedUser.emailVerified,
        mobileVerified: updatedUser.mobileVerified,
        userPhoto: updatedUser.userPhoto,
      },
    });
  } catch (error) {
    console.error("Edit User Controller Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email address or mobile number is already registered.",
        success: false,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

// Password Change By User
export const changePasswordByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        message: "Please Login Again",
        success: false,
      });
    }

    const { userPassword, updatePassword } = req.body;
    if (!userPassword || !updatePassword) {
      return res.status(400).json({
        message: "Pleasee fill all required fields",
        success: false,
      });
    }

    const user = await User.findById(userId).select("+userPassword");
    if (!user) {
      return res.status(400).json({
        message: "User is not exist any more",
        success: false,
      });
    }

    const passwordCheck = await bcrypt.compare(userPassword, user.userPassword);
    if (!passwordCheck) {
      return res.status(400).json({
        message: "Password Not Matched",
        success: false,
      });
    }

    user.userPassword = updatePassword;
    user.passwordChangedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Password update successfully",
      success: true,
    });
  } catch (error) {
    console.log(`Controller Error - ${error}`);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const ADMIN_USER_FIELDS = [
  "_id",
  "userName",
  "userEmail",
  "userMobile",
  "userCity",
  "userDOB",
  "userGender",
  "userRole",
  "userVerified",
  "emailVerified",
  "mobileVerified",
  "userPhoto",
  "createdAt",
  "updatedAt",
].join(" ");

export const userById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
        success: false,
      });
    }

    const user = await User.findById(userId)
      .select(ADMIN_USER_FIELDS)
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully.",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Admin get user error:", error);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

export const userEditByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const body = req.body ?? {};

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
        success: false,
      });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    const updateData = {};

    const textFields = {
      userName: { label: "Name", max: 100 },
      userEmail: { label: "Email", max: 254 },
      userMobile: { label: "Mobile number", max: 10 },
      userCity: { label: "City", max: 100 },
    };

    for (const [field, rules] of Object.entries(textFields)) {
      if (body[field] === undefined) continue;

      if (
        typeof body[field] !== "string" ||
        !body[field].trim() ||
        body[field].trim().length > rules.max
      ) {
        return res.status(400).json({
          message: `Enter a valid ${rules.label.toLowerCase()}.`,
          success: false,
        });
      }

      updateData[field] = body[field].trim();
    }

    if (updateData.userEmail !== undefined) {
      updateData.userEmail = updateData.userEmail.toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.userEmail)) {
        return res.status(400).json({
          message: "Enter a valid email address.",
          success: false,
        });
      }
    }

    if (
      updateData.userMobile !== undefined &&
      !/^[6-9]\d{9}$/.test(updateData.userMobile)
    ) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Indian mobile number.",
        success: false,
      });
    }

    if (body.userRole !== undefined) {
      if (!["User", "Admin", "Doctor"].includes(body.userRole)) {
        return res.status(400).json({
          message: "Invalid user role.",
          success: false,
        });
      }

      updateData.userRole = body.userRole;
    }

    if (body.userGender !== undefined) {
      if (!["Male", "Female", "Other"].includes(body.userGender)) {
        return res.status(400).json({
          message: "Invalid gender.",
          success: false,
        });
      }

      updateData.userGender = body.userGender;
    }

    for (const field of [
      "userVerified",
      "emailVerified",
      "mobileVerified",
    ]) {
      if (body[field] === undefined) continue;

      if (typeof body[field] !== "boolean") {
        return res.status(400).json({
          message: `${field} must be true or false.`,
          success: false,
        });
      }

      updateData[field] = body[field];
    }

    if (body.userDOB !== undefined) {
      const value = body.userDOB;

      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return res.status(400).json({
          message: "Date of birth must use YYYY-MM-DD.",
          success: false,
        });
      }

      const dob = new Date(`${value}T00:00:00.000Z`);

      if (
        Number.isNaN(dob.getTime()) ||
        dob.toISOString().slice(0, 10) !== value ||
        dob > new Date()
      ) {
        return res.status(400).json({
          message: "Enter a valid date of birth.",
          success: false,
        });
      }

      updateData.userDOB = dob;
    }

    if (body.userPhoto !== undefined) {
      if (typeof body.userPhoto !== "string") {
        return res.status(400).json({
          message: "Profile photo must be a URL string.",
          success: false,
        });
      }

      const photo = body.userPhoto.trim();

      if (photo) {
        let validPhoto = false;

        try {
          const url = new URL(photo);
          validPhoto = ["https:", "http:"].includes(url.protocol);
        } catch {
          validPhoto = false;
        }

        if (!validPhoto) {
          return res.status(400).json({
            message: "Enter a valid HTTP or HTTPS photo URL.",
            success: false,
          });
        }
      }

      // Empty string removes the existing photo URL.
      updateData.userPhoto = photo;
    }

    if (
      updateData.userEmail !== undefined &&
      updateData.userEmail !== existingUser.userEmail
    ) {
      const emailExists = await User.exists({
        userEmail: updateData.userEmail,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email address is already registered.",
          success: false,
        });
      }

      if (body.emailVerified === undefined) {
        updateData.emailVerified = false;
      }
    }

    if (
      updateData.userMobile !== undefined &&
      updateData.userMobile !== existingUser.userMobile
    ) {
      const mobileExists = await User.exists({
        userMobile: updateData.userMobile,
        _id: { $ne: userId },
      });

      if (mobileExists) {
        return res.status(409).json({
          message: "Mobile number is already registered.",
          success: false,
        });
      }

      if (body.mobileVerified === undefined) {
        updateData.mobileVerified = false;
      }
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({
        message: "Please provide information to update.",
        success: false,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select(ADMIN_USER_FIELDS);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User updated successfully.",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin edit user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email address or mobile number is already registered.",
        success: false,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// All Users For Admin
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const allUsers = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "15",
      search = "",
      role,
      verification,
    } = req.query;

    // Reject array/object query values.
    const queryValues = [page, limit, search, role, verification];

    if (
      queryValues.some(
        (value) => value !== undefined && typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters.",
      });
    }

    if (!/^[1-9]\d*$/.test(page) || !/^[1-9]\d*$/.test(limit)) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive whole numbers.",
      });
    }

    const requestedPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isSafeInteger(requestedPage) ||
      !Number.isSafeInteger(pageLimit) ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination. Limit cannot exceed 100.",
      });
    }

    const searchText = search.trim();

    if (searchText.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search cannot exceed 100 characters.",
      });
    }

    const filter = {};

    if (role && role !== "all") {
      const allowedRoles = ["User", "Admin", "Doctor"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role.",
        });
      }

      filter.userRole = role;
    }

    if (verification && verification !== "all") {
      if (!["verified", "unverified"].includes(verification)) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification filter.",
        });
      }

      filter.userVerified = verification === "verified";
    }

    if (searchText) {
      const searchRegex = new RegExp(escapeRegex(searchText), "i");

      filter.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { userMobile: searchRegex },
      ];
    }

    // Count matching users before applying pagination.
    const total = await User.countDocuments(filter);

    const totalPages = Math.max(1, Math.ceil(total / pageLimit));

    // Clamp the page if records have been removed or filters changed.
    const currentPage = Math.min(requestedPage, totalPages);
    const skip = (currentPage - 1) * pageLimit;

    const users = await User.find(filter)
      .select(
        [
          "_id",
          "userName",
          "userEmail",
          "userMobile",
          "userRole",
          "userCity",
          "userGender",
          "userPhoto",
          "userVerified",
          "emailVerified",
          "mobileVerified",
          "createdAt",
        ].join(" ")
      )
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users. Please try again.",
    });
  }
};



// Forgot Password
export const forgotPassword = async(req,res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail?.trim()) {
      return res.status(400).json({
        message: "Email address is required.",
        success: false,
      });
    }

    const normalizedEmail = userEmail
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      userEmail: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message:
          "No user found with this email address.",
        success: false,
      });
    }

    const purpose = "PASSWORD_RESET";
    const currentTime = new Date();

    let otpRecord = await OTP.findOne({
      userId: user._id,
      purpose,
    }).sort({
      createdAt: -1,
    });

    if (otpRecord) {
      // Check active 15-minute lock
      if (
        otpRecord.lockedUntil &&
        otpRecord.lockedUntil > currentTime
      ) {
        const remainingMinutes = Math.ceil(
          (otpRecord.lockedUntil.getTime() -
            currentTime.getTime()) /
            (60 * 1000)
        );

        return res.status(429).json({
          message:
            `Maximum OTP attempts exceeded. ` +
            `Please try again after ${remainingMinutes} minute(s).`,
          success: false,
        });
      }

      /*
       * Fallback: apply lock if attempts reached
       * five but lockedUntil was not set.
       */
      if (
        otpRecord.attempts >=
          MAX_OTP_ATTEMPTS &&
        !otpRecord.lockedUntil
      ) {
        const lockedUntil = new Date(
          currentTime.getTime() +
            OTP_LOCK_MINUTES *
              60 *
              1000
        );

        otpRecord.lockedUntil =
          lockedUntil;

        // TTL deletes the record after lock ends
        otpRecord.expiresAt =
          lockedUntil;

        await otpRecord.save();

        return res.status(429).json({
          message:
            "Maximum OTP attempts exceeded. Please try again after 15 minutes.",
          success: false,
        });
      }

      // One-minute resend restriction
      if (otpRecord.requestedAt) {
        const nextResendTime =
          otpRecord.requestedAt.getTime() +
          OTP_RESEND_SECONDS * 1000;

        const otpStillValid =
          otpRecord.expiresAt >
          currentTime;

        if (
          otpStillValid &&
          nextResendTime >
            currentTime.getTime()
        ) {
          const remainingSeconds =
            Math.ceil(
              (nextResendTime -
                currentTime.getTime()) /
                1000
            );

          return res.status(429).json({
            message:
              `Please wait ${remainingSeconds} second(s) ` +
              `before requesting another OTP.`,
            success: false,
          });
        }
      }
    }

    // Generate a fresh OTP
    const generatedOTP = generateOTP();

    const otpHash = await bcrypt.hash(
      generatedOTP,
      10
    );

    const expiresAt = new Date(
      currentTime.getTime() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

    if (otpRecord) {
      // Update existing record during resend
      otpRecord.otpHash = otpHash;
      otpRecord.destination =
        normalizedEmail;
      otpRecord.channel = "EMAIL";

      // New OTP gets five fresh attempts
      otpRecord.attempts = 0;
      otpRecord.lockedUntil = null;
      otpRecord.requestedAt =
        currentTime;
      otpRecord.expiresAt = expiresAt;

      await otpRecord.save();
    } else {
      // Create record during first request
      otpRecord = new OTP({
        userId: user._id,
        purpose,
        channel: "EMAIL",
        destination: normalizedEmail,
        otpHash,
        attempts: 0,
        lockedUntil: null,
        requestedAt: currentTime,
        expiresAt,
      });

      await otpRecord.save();
    }

    try {
      await sendEmail({
        to: normalizedEmail,

        subject: "Password Reset OTP",

        text: `
Your password reset OTP is ${generatedOTP}.

This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.
You have a maximum of five attempts.

Do not share this OTP with anyone.
        `.trim(),

        html: `
          <div
            style="
              max-width: 560px;
              margin: auto;
              padding: 30px;
              font-family: Arial, sans-serif;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
            "
          >
            <h2>Password Reset</h2>

            <p>Hello ${user.userName},</p>

            <p>
              Use the following OTP to reset
              your password:
            </p>

            <div
              style="
                margin: 24px 0;
                padding: 18px;
                background: #f3f4f6;
                border-radius: 8px;
                text-align: center;
              "
            >
              <span
                style="
                  font-size: 32px;
                  font-weight: 700;
                  letter-spacing: 8px;
                "
              >
                ${generatedOTP}
              </span>
            </div>

            <p>
              This OTP expires in
              <strong>
                ${OTP_EXPIRY_MINUTES} minutes
              </strong>.
            </p>

            <p>
              You have a maximum of five attempts.
            </p>

            <p>
              If you did not request this,
              please ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      /*
       * Delete the unusable OTP so the user
       * can request another OTP immediately.
       */
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      console.error(
        "OTP email delivery error:",
        emailError
      );

      return res.status(500).json({
        message:
          "OTP email could not be delivered. Please try again.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully.",
      success: true,
    });
  } catch (error) {
    console.error(
      "Forgot Password Controller Error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// Reset Password And Verify OTP
export const resetPasswordAndVerifyOtp = async (req, res) => {
    try {
      const {
        userEmail,
        otp,
        newPassword,
      } = req.body;

      if (
        !userEmail?.trim() ||
        !otp ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Email, OTP and new password are required.",
          success: false,
        });
      }

      /*
       * Your model requires eight characters,
       * so controller validation must match.
       */
      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            "Password must contain at least eight characters.",
          success: false,
        });
      }

      const normalizedEmail = userEmail
        .trim()
        .toLowerCase();

      const user = await User.findOne({
        userEmail: normalizedEmail,
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired OTP.",
          success: false,
        });
      }

      /*
       * If this fails, it throws an error.
       * Execution immediately moves to catch,
       * so the password is not changed.
       */
      await verifyAndConsumeOtp({
        userId: user._id,
        purpose: "PASSWORD_RESET",
        destination: normalizedEmail,
        submittedOtp: otp,
      });

      /*
       * Your pre-save middleware hashes the
       * password and sets passwordChangedAt.
       */
      user.userPassword = newPassword;
      user.passwordChangedAt = new Date();

      await user.save();

      const isProduction =
        process.env.NODE_ENV ===
        "production";

      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? "none"
          : "lax",
        path: "/",
      });

      return res.status(200).json({
        message:
          "Password reset successfully. Please log in again.",
        success: true,
      });
    } catch (error) {
      console.error(
        "Reset Password Controller Error:",
        error
      );

      return res
        .status(error.statusCode || 500)
        .json({
          message:
            error.statusCode
              ? error.message
              : "Internal server error.",
          success: false,
        });
    }
};



export const emailVerified = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please sign in again.",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please sign in again.",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message: "Your email address is already verified.",
        success: true,
        emailVerified: true,
      });
    }

    const purpose = "EMAIL_VERIFICATION";
    const currentTime = new Date();

    let otpRecord = await OTP.findOne({
      userId: user._id,
      purpose,
    })
      .sort({ createdAt: -1 })
      .select("+otpHash");

    if (otpRecord) {
      const lockExpiresAt = otpRecord.lockedUntil
        ? new Date(otpRecord.lockedUntil).getTime()
        : null;

      // An active lock blocks new OTP requests.
      if (lockExpiresAt && lockExpiresAt > currentTime.getTime()) {
        const retryAfterSeconds = Math.ceil(
          (lockExpiresAt - currentTime.getTime()) / 1000
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Maximum OTP attempts exceeded. Please try again after ${Math.ceil(
            retryAfterSeconds / 60
          )} minute(s).`,
          success: false,
          retryAfterSeconds,
        });
      }

      /*
       * TTL cleanup is asynchronous. An expired lock may still
       * exist in the database, so explicitly clear it.
       */
      if (lockExpiresAt && lockExpiresAt <= currentTime.getTime()) {
        otpRecord.lockedUntil = null;
        otpRecord.attempts = 0;
      } else if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        const lockedUntil = new Date(
          currentTime.getTime() + OTP_LOCK_MINUTES * 60 * 1000
        );

        otpRecord.lockedUntil = lockedUntil;
        otpRecord.expiresAt = lockedUntil;

        await otpRecord.save();

        const retryAfterSeconds = OTP_LOCK_MINUTES * 60;

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Maximum OTP attempts exceeded. Please try again after ${OTP_LOCK_MINUTES} minute(s).`,
          success: false,
          retryAfterSeconds,
        });
      }

      const nextResendTime =
        new Date(otpRecord.requestedAt).getTime() +
        OTP_RESEND_SECONDS * 1000;

      // Apply the resend cooldown even if the previous email failed.
      if (nextResendTime > currentTime.getTime()) {
        const retryAfterSeconds = Math.ceil(
          (nextResendTime - currentTime.getTime()) / 1000
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Please wait ${retryAfterSeconds} second(s) before requesting another OTP.`,
          success: false,
          retryAfterSeconds,
        });
      }
    }

    // Convert to a string because bcrypt expects a string or buffer.
    const generatedOTP = String(generateOTP());
    const otpHash = await bcrypt.hash(generatedOTP, 10);

    const expiresAt = new Date(
      currentTime.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    if (otpRecord) {
      otpRecord.otpHash = otpHash;
      otpRecord.destination = user.userEmail;
      otpRecord.channel = "EMAIL";
      otpRecord.requestedAt = currentTime;
      otpRecord.expiresAt = expiresAt;
      otpRecord.lockedUntil = null;

      /*
       * Preserve failed attempts when resending.
       * Requesting another OTP must not bypass the attempt limit.
       */
      await otpRecord.save();
    } else {
      otpRecord = await OTP.create({
        userId: user._id,
        purpose,
        channel: "EMAIL",
        destination: user.userEmail,
        otpHash,
        attempts: 0,
        lockedUntil: null,
        requestedAt: currentTime,
        expiresAt,
      });
    }

    // Escape user-provided text before inserting it into HTML.
    const safeName = String(user.userName || "there").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]
    );

    try {
      await sendEmail({
        to: user.userEmail,
        subject: "Email Verification OTP",

        text: `
Hello ${user.userName || "there"},

Your email verification OTP is ${generatedOTP}.

This OTP expires in ${OTP_EXPIRY_MINUTES} minute(s).
You can make up to ${MAX_OTP_ATTEMPTS} incorrect verification attempts before a temporary lock.

Only the latest OTP is valid.
Do not share this OTP with anyone.
        `.trim(),

        html: `
          <div style="
            max-width: 560px;
            margin: auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            color: #243e2e;
            border: 1px solid #d6e1d1;
            border-radius: 12px;
            background: #fafaf4;
          ">
            <h2>Email Verification</h2>

            <p>Hello ${safeName},</p>

            <p>Use the following OTP to verify your email address:</p>

            <div style="
              margin: 24px 0;
              padding: 18px;
              background: #eaf1e8;
              border-radius: 8px;
              text-align: center;
            ">
              <span style="
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
              ">
                ${generatedOTP}
              </span>
            </div>

            <p>
              This OTP expires in
              <strong>${OTP_EXPIRY_MINUTES} minute(s)</strong>.
            </p>

            <p>
              You can make up to ${MAX_OTP_ATTEMPTS} incorrect
              verification attempts before a temporary lock.
            </p>

            <p>Only the latest OTP is valid.</p>
            <p>Do not share this OTP with anyone.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("OTP email delivery error:", emailError);

      /*
       * Retain the record so repeated delivery failures cannot
       * bypass the resend cooldown.
       */
      return res.status(502).json({
        message:
          "OTP email could not be delivered. Please wait before requesting another OTP.",
        success: false,
        retryAfterSeconds: OTP_RESEND_SECONDS,
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully.",
      success: true,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      resendAfterSeconds: OTP_RESEND_SECONDS,
    });
  } catch (error) {
    console.error("Email verification OTP error:", error);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};



// User Email Verified
export const userEmailVerified = async (req,res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required.",
        success: false,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        message: "Email address is already verified.",
        success: true,
      });
    }

    await verifyAndConsumeOtp({
      userId: user._id,
      purpose: "EMAIL_VERIFICATION",
      destination: user.userEmail,
      submittedOtp: otp,
    });

    user.emailVerified = true;

    await user.save();

    return res.status(200).json({
      message: "Email address verified successfully.",
      success: true,
      emailVerified: true,
    });
  } catch (error) {
    return res
        .status(error.statusCode || 500)
        .json({
          message:
            error.statusCode
              ? error.message
              : "Internal server error.",
          success: false,
        });
  }
};



// Accepts a 10-digit Indian number or a number prefixed with 91/+91.
const normalizeIndianMobile = (mobile) => {
  const digits = String(mobile ?? "").replace(/\D/g, "");

  const nationalNumber =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;

  if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
    const error = new Error("Invalid Indian mobile number.");
    error.statusCode = 400;
    throw error;
  }

  return `+91${nationalNumber}`;
};

// Send mobile verification OTP
export const mobileVerified = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please sign in again.",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    if (user.mobileVerified) {
      return res.status(200).json({
        message: "Mobile number is already verified.",
        success: true,
        mobileVerified: true,
      });
    }

    const mobileNumber = normalizeIndianMobile(user.userMobile);
    const purpose = "MOBILE_VERIFICATION";
    const currentTime = new Date();
    const now = currentTime.getTime();

    let otpRecord = await OTP.findOne({
      userId: user._id,
      purpose,
    })
      .sort({ createdAt: -1 })
      .select("+otpHash");

    if (otpRecord) {
      const lockedUntil = otpRecord.lockedUntil
        ? new Date(otpRecord.lockedUntil).getTime()
        : null;

      if (lockedUntil && lockedUntil > now) {
        const retryAfterSeconds = Math.ceil(
          (lockedUntil - now) / 1000
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Maximum OTP attempts exceeded. Please try again after ${Math.ceil(
            retryAfterSeconds / 60
          )} minute(s).`,
          success: false,
          retryAfterSeconds,
        });
      }

      // Expired records may remain until MongoDB TTL cleanup runs.
      if (lockedUntil && lockedUntil <= now) {
        otpRecord.lockedUntil = null;
        otpRecord.attempts = 0;
      } else if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        const lockExpiry = new Date(
          now + OTP_LOCK_MINUTES * 60 * 1000
        );

        otpRecord.lockedUntil = lockExpiry;
        otpRecord.expiresAt = lockExpiry;

        await otpRecord.save();

        const retryAfterSeconds = OTP_LOCK_MINUTES * 60;

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Maximum OTP attempts exceeded. Please try again after ${OTP_LOCK_MINUTES} minute(s).`,
          success: false,
          retryAfterSeconds,
        });
      }

      const nextResendTime =
        new Date(otpRecord.requestedAt).getTime() +
        OTP_RESEND_SECONDS * 1000;

      if (nextResendTime > now) {
        const retryAfterSeconds = Math.ceil(
          (nextResendTime - now) / 1000
        );

        res.set("Retry-After", String(retryAfterSeconds));

        return res.status(429).json({
          message: `Please wait ${retryAfterSeconds} second(s) before requesting another OTP.`,
          success: false,
          retryAfterSeconds,
        });
      }
    }

    const generatedOTP = String(generateOTP());
    const otpHash = await bcrypt.hash(generatedOTP, 10);

    const expiresAt = new Date(
      now + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    if (otpRecord) {
      otpRecord.otpHash = otpHash;
      otpRecord.destination = mobileNumber;
      otpRecord.channel = "MOBILE";
      otpRecord.requestedAt = currentTime;
      otpRecord.expiresAt = expiresAt;
      otpRecord.lockedUntil = null;

      // Preserve failed attempts when resending.
      await otpRecord.save();
    } else {
      otpRecord = await OTP.create({
        userId: user._id,
        purpose,
        channel: "MOBILE",
        destination: mobileNumber,
        otpHash,
        attempts: 0,
        lockedUntil: null,
        requestedAt: currentTime,
        expiresAt,
      });
    }

    try {
      await sendSMS({
        mobile: mobileNumber,
        message:
          `${generatedOTP} is your QYX mobile verification OTP. ` +
          `It expires in ${OTP_EXPIRY_MINUTES} minute(s). ` +
          `Do not share this OTP with anyone.`,
      });
    } catch (smsError) {
      console.error("OTP SMS delivery error:", smsError);

      // Retain the record to enforce the resend cooldown.
      return res.status(502).json({
        message:
          "OTP SMS could not be delivered. Please wait before requesting another OTP.",
        success: false,
        retryAfterSeconds: OTP_RESEND_SECONDS,
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully.",
      success: true,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      resendAfterSeconds: OTP_RESEND_SECONDS,
    });
  } catch (error) {
    console.error("Send mobile verification OTP error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Internal server error.",
      success: false,
    });
  }
};

// Verify mobile OTP
export const userMobileVerified = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please sign in again.",
        success: false,
      });
    }

    const { otp } = req.body ?? {};

    // Accept OTPs as strings to preserve any leading zero.
    if (typeof otp !== "string" || !/^\d+$/.test(otp.trim())) {
      return res.status(400).json({
        message: "Please enter a valid OTP as a string.",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    if (user.mobileVerified) {
      return res.status(200).json({
        message: "Mobile number is already verified.",
        success: true,
        mobileVerified: true,
      });
    }

    const mobileNumber = normalizeIndianMobile(user.userMobile);

    await verifyAndConsumeOtp({
      userId: user._id,
      purpose: "MOBILE_VERIFICATION",
      destination: mobileNumber,
      submittedOtp: otp.trim(),
    });

    /*
     * Only mark the verified number as verified.
     * If the number changed during verification, this update fails.
     */
    const result = await User.updateOne(
      {
        _id: user._id,
        userMobile: user.userMobile,
      },
      {
        $set: { mobileVerified: true },
      },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(409).json({
        message:
          "Your mobile number changed. Please request a new OTP.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Mobile number verified successfully.",
      success: true,
      mobileVerified: true,
    });
  } catch (error) {
    console.error("Mobile verification error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Internal server error.",
      success: false,
    });
  }
};