import express from "express";
import {
  addEmployee,
  loginEmployee,
  getEmployees,
  getEmployeeInfo,
  deleteEmployee,
  updateEmployee,
  getEmployeeTasks,
} from "../controllers/employeeController.js";
import upload from "../middlewares/upload.js";

const employeeRouter = express.Router();

employeeRouter.post("/add", upload.single("profile_pic"), addEmployee);
employeeRouter.get("/get-all", getEmployees);
employeeRouter.get("/get/:id", getEmployeeInfo);
employeeRouter.post("/login", loginEmployee);
employeeRouter.delete("/delete/:id", deleteEmployee);
employeeRouter.put("/update/:id", updateEmployee);
employeeRouter.get("/tasks/:id", getEmployeeTasks);

export default employeeRouter;
