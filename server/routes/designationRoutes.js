import express from "express";

import { getDesignations, addDesignation, deleteDesignation } from "../controllers/designationController.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const designationRouter = express.Router();

designationRouter.use(protectAdmin);

designationRouter.get("/get-all", getDesignations);
designationRouter.post("/add", addDesignation);
designationRouter.delete("/delete/:id", deleteDesignation);

export default designationRouter;