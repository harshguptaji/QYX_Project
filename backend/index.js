// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import multer from "multer";

// import {connectDB} from "./dbConnect.js";

// import userRoutes from "./routes/userRoute.js";
// import doctorRoutes from "./routes/doctorRoute.js";

// dotenv.config({quiet: true});

// const app = express();

// /*
//  * Request body middleware
//  */

// app.use(express.json());

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

// app.use(cookieParser());

// app.use(
//   cors({
//     // origin: "http://localhost:5173",
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

// /*
//  * Connect database
//  */

// connectDB();

// /*
//  * Application routes
//  */

// app.use("/api/user",userRoutes);

// app.use("/api/doctor",doctorRoutes);

// /*
//  * 404 handler
//  */

// app.use((req, res) => {
//   return res.status(404).json({
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//     success: false,
//   });
// });

// /*
//  * Global error handler
//  *
//  * It must be placed after all routes.
//  */
// app.use(
//   (error, req, res, next) => {
//     console.error("Application Error:",error);

//     /*
//      * Multer-specific errors
//      */

//     if (error instanceof multer.MulterError) {
//       if (error.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//             message:"Each uploaded file must be 10 MB or smaller.",
//             success: false,
//           });
//       }

//       if (
//         error.code === "LIMIT_FILE_COUNT") {
//         return res.status(400).json({
//             message: "You can upload a maximum of five files.",
//             success: false,
//           });
//       }

//       if (error.code === "LIMIT_UNEXPECTED_FILE") {
//         return res.status(400).json({
//             message: `Unexpected or duplicate file field: ${error.field}`,
//             success: false,
//           });
//       }

//       return res.status(400).json({
//         message: error.message,
//         success: false,
//       });
//     }

//     /*
//      * Custom upload errors generated
//      * inside fileFilter.
//      */
//     if (error.statusCode) {
//       return res.status(error.statusCode).json({
//           message: error.message,
//           success: false,
//         });
//     }

//     /*
//      * Unknown server errors
//      */
//     return res.status(500).json({
//       message: "Internal server error.",
//       success: false,
//     });
//   }
// );

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./dbConnect.js";

import userRoutes from "./routes/userRoute.js";
import doctorRoutes from "./routes/doctorRoute.js";

dotenv.config({ quiet: true });

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const currentDirectory = path.dirname(
  fileURLToPath(import.meta.url)
);

const frontendDist = path.resolve(
  currentDirectory,
  "../frontend/dist"
);

/*
 * Request middleware
 */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// Local React development uses a different origin.
// Production frontend and API share the same origin.
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

/*
 * Database connection
 */

connectDB();

/*
 * API routes
 */

app.use("/api/user", userRoutes);
app.use("/api/doctor", doctorRoutes);

/*
 * Serve React in production
 *
 * Keep this after API routes and before the 404 handler.
 */

if (isProduction) {
  app.use(express.static(frontendDist));

  app.use((req, res, next) => {
    const isApiRequest = /^\/api(?:\/|$)/.test(req.path);

    if (
      req.method === "GET" &&
      !isApiRequest &&
      req.accepts("html")
    ) {
      return res.sendFile(
        path.join(frontendDist, "index.html"),
        (error) => {
          if (error) next(error);
        }
      );
    }

    next();
  });
}

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
 */

app.use((error, req, res, next) => {
  console.error("Application Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Each uploaded file must be 10 MB or smaller.",
        success: false,
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
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

  const statusCode = error.statusCode || error.status;

  if (
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode < 500
  ) {
    return res.status(statusCode).json({
      message: error.message,
      success: false,
    });
  }

  return res.status(500).json({
    message: "Internal server error.",
    success: false,
  });
});

const PORT = process.env.PORT || 5000;

console.log("Starting HTTP server...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});