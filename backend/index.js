import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";

import {connectDB} from "./dbConnect.js";

import userRoutes from "./routes/userRoute.js";
import doctorRoutes from "./routes/doctorRoute.js";

dotenv.config({quiet: true});

const app = express();

/*
 * Request body middleware
 */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

/*
 * Connect database
 */

connectDB();

/*
 * Application routes
 */

app.use("/api/user",userRoutes);

app.use("/api/doctor",doctorRoutes);

/*
 * 404 handler
 */

app.use((req, res) => {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });
});

/*
 * Global error handler
 *
 * It must be placed after all routes.
 */
app.use(
  (error, req, res, next) => {
    console.error("Application Error:",error);

    /*
     * Multer-specific errors
     */

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message:"Each uploaded file must be 10 MB or smaller.",
            success: false,
          });
      }

      if (
        error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
            message: "You can upload a maximum of five files.",
            success: false,
          });
      }

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            message: `Unexpected or duplicate file field: ${error.field}`,
            success: false,
          });
      }

      return res.status(400).json({
        message: error.message,
        success: false,
      });
    }

    /*
     * Custom upload errors generated
     * inside fileFilter.
     */
    if (error.statusCode) {
      return res.status(error.statusCode).json({
          message: error.message,
          success: false,
        });
    }

    /*
     * Unknown server errors
     */
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});