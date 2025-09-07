import express from "express";

import { getDepartments, addDepartment, deleteDepartment } from "../controllers/departmentController.js";

const departmentRouter = express.Router();

departmentRouter.get("/get-all", getDepartments);
departmentRouter.post("/add", addDepartment);
departmentRouter.delete("/delete/:id", deleteDepartment);

export default departmentRouter;