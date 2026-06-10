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
  getProjectsForReportingManager,
  bulkUpdate,
  bulkDelete,
  archiveProject,
  unarchiveProject,
  getArchivedProjects,
  getProjectWithArchived,
} from "../controllers/projectController.js";
import upload from "../middlewares/upload.js"; 
import { protectAdmin, requireMaulshree } from "../middlewares/adminAuth.js";
import { protectAny } from "../middlewares/auth.js";

const projectRouter = express.Router();

projectRouter.use(protectAny);

projectRouter.get("/get-all", getProjects);
projectRouter.get("/get/:id", getProjectInfo);
projectRouter.post("/add", protectAdmin, requireMaulshree, upload.array("files"), addProject);
projectRouter.delete("/delete/:id", protectAdmin, requireMaulshree, deleteProject);
projectRouter.put("/update/:id", protectAdmin, requireMaulshree, upload.array("files"), updateProject);
projectRouter.put("/change-status/:projectId", changeProjectStatus);
projectRouter.put("/change-priority/:projectId", changeProjectPriority);
projectRouter.post(
  "/content/:projectId",
  upload.array("files"),
  addProjectContent
);

projectRouter.get("/all-tasks-projects", getAllProjectsWithTasks);
projectRouter.get("/manager/:managerId", getProjectsForReportingManager);
projectRouter.patch("/bulk-update", protectAdmin, requireMaulshree, bulkUpdate);
projectRouter.delete("/bulk-delete", protectAdmin, requireMaulshree, bulkDelete);

projectRouter.put("/archive/:projectId", protectAdmin, requireMaulshree, archiveProject);
projectRouter.put("/unarchive/:projectId", protectAdmin, requireMaulshree, unarchiveProject);
projectRouter.get("/get-archived", protectAdmin, requireMaulshree, getArchivedProjects);
projectRouter.get("/get-all-archived", getProjectWithArchived);

export default projectRouter;
