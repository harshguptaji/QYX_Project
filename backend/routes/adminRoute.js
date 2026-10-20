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

// Existing admin details path — keep last.
router.get(
  "/:adminId",
  authorizeAdminRoles("Admin", "Root"),
  adminById
);

export default router;