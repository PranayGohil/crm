import express from "express";
import {
  addProject,
  getProjects,
  getProjectInfo,
  deleteProject,
  updateProject,
  changeProjectStatus,
  changeProjectPriority,
  addProjectContent,
  getAllProjectsWithTasks,
  bulkUpdate,
  bulkDelete,
} from "../controllers/projectController.js";
import upload from "../middlewares/upload.js"; // Ensure this is the correct path to your upload middleware

const projectRouter = express.Router();

projectRouter.get("/get-all", getProjects);
projectRouter.get("/get/:id", getProjectInfo);
projectRouter.post("/add", addProject);
projectRouter.delete("/delete/:id", deleteProject);
projectRouter.put("/update/:id", updateProject);
projectRouter.put("/change-status/:projectId", changeProjectStatus);
projectRouter.put("/change-priority/:projectId", changeProjectPriority);
projectRouter.post(
  "/content/:projectId",
  upload.array("files"),
  addProjectContent
);

projectRouter.get("/all-tasks-projects", getAllProjectsWithTasks);
projectRouter.patch("/bulk-update", bulkUpdate);
projectRouter.delete("/bulk-delete", bulkDelete);

export default projectRouter;
