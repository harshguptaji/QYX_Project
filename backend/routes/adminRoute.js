import express from "express";

import {
  isAdminAuthenticated,
  authorizeAdminRoles,
} from "../middleware/adminAuth.js";

import {
  adminRegister,
  adminLogin,
  adminLogout,
  adminMe,
  adminEdit,
  adminDelete,
  adminById,
  allAdmins,
} from "../controllers/adminController.js";

import {
  allUsers,
  userEditByAdmin,
  userById,
} from "../controllers/userController.js";

import {
  getAllContacts,
  getContactById,
  markContactAsRead,
  markContactAsUnread,
  getContactStats,
} from "../controllers/contactController.js";

import {
  createQuiz,
  getAdminQuiz,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../controllers/quizController.js";

import {
  getAllQuizResponses,
  getQuizResponseById,
} from "../controllers/quizResponseController.js";

const router = express.Router();

// Existing authentication routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Protect every route below.
router.use(isAdminAuthenticated);

// Existing admin registration and information routes
router.post(
  "/register",
  authorizeAdminRoles("Root", "Admin"),
  adminRegister
);

router.get("/me", adminMe);

// Preserves your existing permission: any authenticated admin.
router.get("/all", allAdmins);

// Existing user routes
router.get(
  "/users",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  allUsers
);

router.get(
  "/users/:userId",
  authorizeAdminRoles("Admin", "Root"),
  userById
);

router.patch(
  "/users/:userId",
  authorizeAdminRoles("Admin", "Root"),
  userEditByAdmin
);

// Contact routes
router.get(
  "/contacts/stats",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  getContactStats
);

router.get(
  "/contacts",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  getAllContacts
);

router.get(
  "/contacts/:contactId",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  getContactById
);

router.patch(
  "/contacts/:contactId/read",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  markContactAsRead
);

router.patch(
  "/contacts/:contactId/unread",
  authorizeAdminRoles("Root", "Admin", "Sub-Admin"),
  markContactAsUnread
);

// Existing admin edit and delete paths
router.patch(
  "/edit/:adminId",
  authorizeAdminRoles("Root"),
  adminEdit
);

router.delete(
  "/delete/:adminId",
  authorizeAdminRoles("Root"),
  adminDelete
);

// Quiz management: Root and Admin only.
// isAdminAuthenticated already runs above these routes.

router.get(
  "/quiz",
  authorizeAdminRoles("Root", "Admin"),
  getAdminQuiz
);

router.post(
  "/quiz",
  authorizeAdminRoles("Root", "Admin"),
  createQuiz
);

router.patch(
  "/quiz",
  authorizeAdminRoles("Root", "Admin"),
  updateQuiz
);

router.post(
  "/quiz/questions",
  authorizeAdminRoles("Root", "Admin"),
  addQuestion
);

// Keep reorder before /:questionId.
router.patch(
  "/quiz/questions/reorder",
  authorizeAdminRoles("Root", "Admin"),
  reorderQuestions
);

router.patch(
  "/quiz/questions/:questionId",
  authorizeAdminRoles("Root", "Admin"),
  updateQuestion
);

router.delete(
  "/quiz/questions/:questionId",
  authorizeAdminRoles("Root", "Admin"),
  deleteQuestion
);


// List, search and filter quiz responses.
router.get(
  "/quiz/responses",
  authorizeAdminRoles("Root", "Admin"),
  getAllQuizResponses
);

// View one response with original questions and selected answers.
router.get(
  "/quiz/responses/:responseId",
  authorizeAdminRoles("Root", "Admin"),
  getQuizResponseById
);


// Existing admin details path — keep last.
router.get(
  "/:adminId",
  authorizeAdminRoles("Admin", "Root"),
  adminById
);

export default router;