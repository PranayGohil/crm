import express from "express";
import {
  addEmployee,
  loginEmployee,
  getEmployees,
  getMultipleEmployees,
  getEmployeeInfo,
  deleteEmployee,
  editEmployee,
  getEmployeeTasks,
  getEmployeeDashboardData,
} from "../controllers/employeeController.js";
import upload from "../middlewares/upload.js";

const employeeRouter = express.Router();

employeeRouter.post("/add", upload.single("profile_pic"), addEmployee);
employeeRouter.get("/get-all", getEmployees);
employeeRouter.get("/get-multiple", getMultipleEmployees);
employeeRouter.get("/get/:id", getEmployeeInfo);
employeeRouter.post("/login", loginEmployee);
employeeRouter.delete("/delete/:id", deleteEmployee);
employeeRouter.post("/edit/:id", upload.single("profile_pic"), editEmployee);
employeeRouter.get("/tasks/:id", getEmployeeTasks);
employeeRouter.get("/dashboard/:employeeId", getEmployeeDashboardData);

export default employeeRouter;
