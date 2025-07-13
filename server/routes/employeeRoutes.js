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
} from "../controllers/employeeController.js";
import upload from "../middlewares/upload.js";

const employeeRouter = express.Router();

employeeRouter.post("/add", upload.single("profile_pic"), addEmployee);
employeeRouter.get("/get-all", getEmployees);
employeeRouter.get('/get-multiple', getMultipleEmployees);
employeeRouter.get("/get/:id", getEmployeeInfo);
employeeRouter.post("/login", loginEmployee);
employeeRouter.delete("/delete/:id", deleteEmployee);
employeeRouter.put("/edit/:id", editEmployee);
employeeRouter.get("/tasks/:id", getEmployeeTasks);

export default employeeRouter;
