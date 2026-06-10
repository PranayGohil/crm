import express from "express";

import { getDepartments, addDepartment, deleteDepartment } from "../controllers/departmentController.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const departmentRouter = express.Router();

departmentRouter.use(protectAdmin);

departmentRouter.get("/get-all", getDepartments);
departmentRouter.post("/add", addDepartment);
departmentRouter.delete("/delete/:id", deleteDepartment);

export default departmentRouter;