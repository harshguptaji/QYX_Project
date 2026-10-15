import express from "express";
import { allUsers, changePasswordByUser, emailVerified, forgotPassword, mobileVerified, resetPasswordAndVerifyOtp, userById, userEditByAdmin, userEditByUser, userEmailVerified, userLogin, userLogout, userMe, userMobileVerified, userRegister } from "../controllers/userController.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const route = express.Router();

route.post("/register", userRegister);
route.post("/login", userLogin);
route.post("/logout",isAuthenticated,userLogout);
route.get("/me",isAuthenticated, userMe);
route.patch("/edit", isAuthenticated, userEditByUser);
route.patch("/edit/password", isAuthenticated, changePasswordByUser);
// route.get("/all", isAuthenticated, isAuthorized("Admin"), allUsers);
route.get("/users",isAuthenticated,isAuthorized("Admin"),allUsers);
route.post("/forgot", forgotPassword);
route.post("/forgot/password", resetPasswordAndVerifyOtp);
route.post("/email", isAuthenticated, emailVerified);
route.post("/email/verified", isAuthenticated, userEmailVerified);
route.post("/mobile", isAuthenticated, mobileVerified);
route.post("/mobile/verified", isAuthenticated, userMobileVerified);
route.patch("/edit/:userId", isAuthenticated, isAuthorized("Admin"), userEditByAdmin);
route.get("/:userId", isAuthenticated, isAuthorized("Admin"), userById);

export default route;