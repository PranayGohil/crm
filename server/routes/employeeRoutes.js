import express from "express";
import {
  checkUsernameAvailability,
  addEmployee,
  loginEmployee,
  getEmployees,
  getMultipleEmployees,
  getEmployeeInfo,
  deleteEmployee,
  editEmployee,
  getEmployeeTasks,
  getEmployeeDashboardData,
  getManagers,
  getEmployeeCompletedTasks,
  getEmployeeActivityHistory,
  getEmployeeTimeTracking,
  searchEmployees,
} from "../controllers/employeeController.js";
import upload from "../middlewares/upload.js";
import { optionalAuth } from "../middlewares/auth.js";
import { protectAdmin, requireMaulshree } from "../middlewares/adminAuth.js";

const employeeRouter = express.Router();

// Public auth endpoints (no token).
employeeRouter.post("/check-username", checkUsernameAvailability);
employeeRouter.post("/login", loginEmployee);

// Admin-only writes: hard auth + stage authorization (no portal calls these).
employeeRouter.post("/add", protectAdmin, requireMaulshree, upload.single("profile_pic"), addEmployee);
employeeRouter.post("/edit/:id", protectAdmin, requireMaulshree, upload.single("profile_pic"), editEmployee);
employeeRouter.delete("/delete/:id", protectAdmin, requireMaulshree, deleteEmployee);

// Shared reads: optional auth → stage-scoped when an admin token is present,
// otherwise unscoped (preserves employee/client portal behavior).
employeeRouter.use(optionalAuth);
employeeRouter.get("/search", searchEmployees);
employeeRouter.get("/get-all", getEmployees);
employeeRouter.get("/get-multiple", getMultipleEmployees);
employeeRouter.get("/get/:id", getEmployeeInfo);
employeeRouter.get("/tasks/:employeeId", getEmployeeTasks);
employeeRouter.get("/dashboard/:employeeId", getEmployeeDashboardData);
employeeRouter.get("/managers", getManagers);
employeeRouter.get("/completed-tasks/:employeeId", getEmployeeCompletedTasks);
employeeRouter.get("/activity-history/:employeeId", getEmployeeActivityHistory);
employeeRouter.get("/time-tracking/:employeeId", getEmployeeTimeTracking);

export default employeeRouter;
