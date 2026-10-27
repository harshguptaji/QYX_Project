import express from "express";

import {
  createCareerApplication,
} from "../controllers/careerController.js";

const router = express.Router();

router.post("/register", createCareerApplication);

export default router;