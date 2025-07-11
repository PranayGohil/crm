import express from "express";
import {
  addSubTask,
  getSubtasksByProjectId,
  addBulkSubTasks,
  getSubTasks,
  getSubTaskInfo,
  deleteSubTask,
  updateSubTask,
  changeSubTaskStatus,
  changeSubTaskPriority,
  getAllProjectsWithSubtasks,
  bulkUpdateSubtasks,
  bulkDeleteSubtasks,
} from "../controllers/subTaskController.js";
import upload from "../middlewares/upload.js";

const subTaskRouter = express.Router();

subTaskRouter.get("/get-all", getSubTasks);
subTaskRouter.get("/project/:projectId", getSubtasksByProjectId);
subTaskRouter.get("/get/:id", getSubTaskInfo);
subTaskRouter.post("/add", upload.array("media_files", 10), addSubTask);
subTaskRouter.post("/add-bulk", addBulkSubTasks);
subTaskRouter.delete("/delete/:id", deleteSubTask);
subTaskRouter.put("/update/:id", upload.array("media_files", 10), updateSubTask);
subTaskRouter.put("/change-status/:id", changeSubTaskStatus);
subTaskRouter.put("/change-priority/:id", changeSubTaskPriority);
subTaskRouter.get("/all-tasks-projects", getAllProjectsWithSubtasks);
subTaskRouter.put("/bulk-update", bulkUpdateSubtasks);
subTaskRouter.post("/bulk-delete", bulkDeleteSubtasks);


export default subTaskRouter;
