import express from "express";
import {
  addProject,
  getProjects,
  getProjectInfo,
  deleteProject,
  updateProject,
  changeProjectStatus,
  getProjectTasks,
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.get("/get-all", getProjects);
projectRouter.get("/get/:id", getProjectInfo);
projectRouter.post("/add", addProject);
projectRouter.delete("/delete/:id", deleteProject);
projectRouter.put("/update/:id", updateProject);
projectRouter.put("/change-status/:id", changeProjectStatus);
projectRouter.get("/tasks/:id", getProjectTasks);

export default projectRouter;
