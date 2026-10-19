import jwt from "jsonwebtoken";

import Admin from "../models/adminModel.js";

import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
} from "../utils/adminCookie.js";

export const isAdminAuthenticated = async (req, res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      message: "Please sign in to your admin account.",
      success: false,
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_ADMIN_SECRET,
      {
        algorithms: ["HS256"],
        issuer: "qyx-api",
        audience: "qyx-admin",
      }
    );
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      res.clearCookie(
        ADMIN_COOKIE_NAME,
        getAdminCookieOptions()
      );

      return res.status(401).json({
        message: "Admin session expired or invalid. Please sign in again.",
        success: false,
      });
    }

    return next(error);
  }

  if (
    typeof decoded !== "object" ||
    decoded.type !== "admin" ||
    typeof decoded.sub !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(decoded.sub) ||
    !Number.isInteger(decoded.iat)
  ) {
    res.clearCookie(
      ADMIN_COOKIE_NAME,
      getAdminCookieOptions()
    );

    return res.status(401).json({
      message: "Invalid admin session.",
      success: false,
    });
  }

  try {
    const admin = await Admin.findById(decoded.sub);

    if (!admin) {
      res.clearCookie(
        ADMIN_COOKIE_NAME,
        getAdminCookieOptions()
      );

      return res.status(401).json({
        message: "Admin account no longer exists.",
        success: false,
      });
    }

    /*
     * Reject tokens issued before the password changed.
     * Conservative comparison also rejects tokens issued during
     * the same second as the change.
     */
    if (
      admin.passwordChangeAt &&
      decoded.iat * 1000 <= admin.passwordChangeAt.getTime()
    ) {
      res.clearCookie(
        ADMIN_COOKIE_NAME,
        getAdminCookieOptions()
      );

      return res.status(401).json({
        message: "Password changed. Please sign in again.",
        success: false,
      });
    }

    req.admin = admin;

    return next();
  } catch (error) {
    return next(error);
  }
};

export const authorizeAdminRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: "Admin authentication required.",
        success: false,
      });
    }

    if (!allowedRoles.includes(req.admin.adminRole)) {
      return res.status(403).json({
        message: "You do not have permission for this action.",
        success: false,
      });
    }

    return next();
  };
};