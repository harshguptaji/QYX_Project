import express from "express";

import {
  getPublicQuiz,
} from "../controllers/quizController.js";

import {
  submitQuizResponse,
} from "../controllers/quizResponseController.js";

const router = express.Router();

router.get("/", getPublicQuiz);
router.post("/responses", submitQuizResponse);

export default router;