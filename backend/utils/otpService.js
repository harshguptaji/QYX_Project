import bcrypt from "bcryptjs";
import crypto from "crypto";
import OTP from "../models/otpModel.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LOCK_MINUTES = 15;
const OTP_RESEND_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

const createOtpError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createNewOtp = async ({ userId, purpose, channel, destination}) => {
  const currentTime = new Date();

  const existingOtp = await OTP.findOne({
    userId,
    purpose,
  }).sort({
    createdAt: -1,
  });

  // User cannot bypass the five-attempt lock
  // by requesting another OTP
  if ( existingOtp?.lockedUntil && existingOtp.lockedUntil > currentTime) {
    const remainingSeconds = Math.ceil( (existingOtp.lockedUntil.getTime() - currentTime.getTime()) / 1000 );

    throw createOtpError( `Too many incorrect attempts. Please try again after ${remainingSeconds} seconds.`, 429 );
  }

  // Prevent repeated email/SMS requests
  if (
    existingOtp &&
    existingOtp.expiresAt > currentTime &&
    currentTime.getTime() -
      existingOtp.requestedAt.getTime() <
      OTP_RESEND_SECONDS * 1000
  ) {
    const remainingSeconds =
      OTP_RESEND_SECONDS -
      Math.floor(
        (currentTime.getTime() -
          existingOtp.requestedAt.getTime()) /
          1000
      );

    throw createOtpError(
      `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      429
    );
  }

  /*
   * Remove every previous OTP for this purpose.
   * Therefore, an older OTP can never be reused.
   */
  await OTP.deleteMany({
    userId,
    purpose,
  });

  const otp = crypto.randomInt(100000, 1000000).toString();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date( currentTime.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000 );

  const otpRecord = await OTP.create({
    userId,
    purpose,
    channel,
    destination,
    otpHash,
    attempts: 0,
    lockedUntil: null,
    requestedAt: currentTime,
    expiresAt,
  });

  return {
    otp,
    otpRecord,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  };
};

export const verifyOtp = async ({
  userId,
  purpose,
  destination,
  otp,
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
    .select("+otpHash +destination");

  if (!otpRecord) {
    throw createOtpError(
      "Invalid or expired OTP."
    );
  }

  // Handle the 15-minute lock
  if (
    otpRecord.lockedUntil &&
    otpRecord.lockedUntil > currentTime
  ) {
    const remainingSeconds = Math.ceil(
      (otpRecord.lockedUntil.getTime() -
        currentTime.getTime()) /
        1000
    );

    throw createOtpError(
      `Too many incorrect attempts. Please request a new OTP after ${remainingSeconds} seconds.`,
      429
    );
  }

  // OTP validity check
  if (otpRecord.expiresAt <= currentTime) {
    throw createOtpError(
      "OTP has expired. Please request a new OTP."
    );
  }

  const otpMatched = await bcrypt.compare(
    otp.toString().trim(),
    otpRecord.otpHash
  );

  if (!otpMatched) {
    const newAttemptCount =
      otpRecord.attempts + 1;

    // Lock after the fifth incorrect attempt
    if (
      newAttemptCount >= MAX_OTP_ATTEMPTS
    ) {
      const lockedUntil = new Date(
        currentTime.getTime() +
          OTP_LOCK_MINUTES * 60 * 1000
      );

      await OTP.updateOne(
        {
          _id: otpRecord._id,
        },
        {
          $set: {
            attempts: newAttemptCount,
            lockedUntil,

            /*
             * Keep the record until the lock ends.
             * MongoDB will then delete it automatically.
             */
            expiresAt: lockedUntil,
          },
        }
      );

      throw createOtpError(
        "Maximum OTP attempts exceeded. Please try again after 15 minutes.",
        429
      );
    }

    await OTP.updateOne(
      {
        _id: otpRecord._id,
      },
      {
        $set: {
          attempts: newAttemptCount,
        },
      }
    );

    const remainingAttempts =
      MAX_OTP_ATTEMPTS - newAttemptCount;

    throw createOtpError(
      `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`,
      400
    );
  }

  /*
   * Atomically delete and consume the OTP.
   * Only the first successful request can use it.
   */
  const consumedOtp =
    await OTP.findOneAndDelete({
      _id: otpRecord._id,
    });

  if (!consumedOtp) {
    throw createOtpError(
      "OTP has already been used."
    );
  }

  return true;
};

export const deleteOtp = async (otpId) => {
  await OTP.deleteOne({
    _id: otpId,
  });
};