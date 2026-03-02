// routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  adminProfileForEmployee,
  isSuperAdmin
} from "../controllers/adminController.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";

const adminRouter = express.Router();

// Public routes
adminRouter.post("/login", adminLogin);
adminRouter.get("/profile-for-employee", adminProfileForEmployee);

// Protected routes (require authentication)
adminRouter.use(verifyToken);

// Profile routes (any admin can access their own profile)
adminRouter.get("/profile", getAdminProfile);
adminRouter.put(
  "/update-profile",
  upload.single("profile_pic"),
  updateAdminProfile
);

// Super admin only routes
adminRouter.get("/all", isSuperAdmin, getAllAdmins);
adminRouter.post(
  "/create",
  isSuperAdmin,
  upload.single("profile_pic"),
  createAdmin
);
adminRouter.put(
  "/:id",
  isSuperAdmin,
  upload.single("profile_pic"),
  updateAdmin
);
adminRouter.delete("/:id", isSuperAdmin, deleteAdmin);

export default adminRouter;