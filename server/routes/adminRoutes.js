import express from "express";
import {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";
import upload from "../middlewares/upload.js";
const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/profile", getAdminProfile);
adminRouter.put(
  "/update-profile",
  upload.single("profile_pic"),
  updateAdminProfile
);

export default adminRouter;
