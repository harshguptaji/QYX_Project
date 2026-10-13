import express from "express";

import {createDoctor,doctorById, getAllDoctors, updateDoctor, viewProfile} from "../controllers/doctorController.js";

import {isAuthenticated,isAuthorized} from "../middleware/auth.js";

import {uploadDoctorFiles} from "../middleware/doctorUpload.js";

const route = express.Router();

route.post("/create",isAuthenticated,isAuthorized("Admin"),uploadDoctorFiles,createDoctor);
route.get("/all",isAuthenticated, isAuthorized("Admin"),getAllDoctors);
route.get("/view/:doctorId",viewProfile);
route.get("/:doctorId",isAuthenticated,isAuthorized("Admin"),doctorById);
route.put("/edit/:doctorId",isAuthenticated,isAuthorized("Admin"),uploadDoctorFiles,updateDoctor);


export default route;