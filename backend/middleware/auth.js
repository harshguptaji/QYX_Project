import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * JWT iat is measured in seconds.
     * JavaScript Date uses milliseconds.
     */
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);

      /*
       * If password was changed after the JWT
       * was issued, this token is no longer valid.
       */
      if (passwordChangedTimestamp >decoded.iat ) {
        return res.status(401).json({
          message: "Password was recently changed. Please log in again.",
          success: false,
        });
      }
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
};

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
          message: "Forbidden: You do not have access to this resourceeeeeeeeee",
      });
    }
    next(); // Proceed to the next middleware or route handler
  };
};
