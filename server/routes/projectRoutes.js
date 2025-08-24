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
import upload from "../middlewares/upload.js"; // Ensure this is the correct path to your upload middleware

const projectRouter = express.Router();

projectRouter.get("/get-all", getProjects);
projectRouter.get("/get/:id", getProjectInfo);
projectRouter.post("/add", upload.array("files"), addProject);
projectRouter.delete("/delete/:id", deleteProject);
projectRouter.put("/update/:id", upload.array("files"), updateProject);
projectRouter.put("/change-status/:projectId", changeProjectStatus);
projectRouter.put("/change-priority/:projectId", changeProjectPriority);
projectRouter.post(
  "/content/:projectId",
  upload.array("files"),
  addProjectContent
);

projectRouter.get("/all-tasks-projects", getAllProjectsWithTasks);
projectRouter.get("/manager/:managerId", getProjectsForReportingManager);
projectRouter.patch("/bulk-update", bulkUpdate);
projectRouter.delete("/bulk-delete", bulkDelete);

projectRouter.put("/archive/:projectId", archiveProject);
projectRouter.put("/unarchive/:projectId", unarchiveProject);
projectRouter.get("/get-archived", getArchivedProjects);
projectRouter.get("/get-all-archived", getProjectWithArchived);

export default projectRouter;
