import express from "express";

import {
  isAdminAuthenticated,
  authorizeAdminRoles,
} from "../middleware/adminAuth.js";

import { adminRegister, adminLogin, adminLogout, adminMe, adminEdit, adminDelete, adminById, allAdmins } from "../controllers/adminController.js";
import { allUsers,userEditByAdmin,userById } from "../controllers/userController.js"
const router = express.Router();

// Public admin authentication routes.
router.post("/login", adminLogin);
router.post("/logout", adminLogout);


// Every route below requires an admin session.
router.use(isAdminAuthenticated);
router.post("/register",authorizeAdminRoles("Root","Admin") ,adminRegister)
router.get("/me", adminMe);
router.get("/all",allAdmins);
router.get("/users",isAdminAuthenticated,authorizeAdminRoles("Root", "Admin", "Sub-Admin"),allUsers);
router.get("/users/:userId",authorizeAdminRoles("Admin","Root"),userById);
router.patch("/users/:userId", isAdminAuthenticated, authorizeAdminRoles("Admin","Root"), userEditByAdmin);
router.patch("/edit/:adminId", authorizeAdminRoles("Root"),adminEdit);
router.delete("/delete/:adminId",authorizeAdminRoles("Root"),adminDelete);
router.get("/:adminId",authorizeAdminRoles("Admin","Root"),adminById);

export default router;