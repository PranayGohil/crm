import express from "express";
import {
  addSubTask,
  getSubtasksByProjectId,
  addBulkSubTasks,
  getSubTasks,
  getSubTaskInfo,
  deleteSubTask,
  updateSubTask,
  completeStage,
  changeSubTaskStatus,
  changeSubTaskPriority,
  getAllProjectsWithSubtasks,
  bulkUpdateSubtasks,
  bulkDeleteSubtasks,
  addComment,
  addMedia,
  removeMedia,
  startTimer,
  stopTimer,
} from "../controllers/subTaskController.js";
import upload from "../middlewares/upload.js";

const subTaskRouter = express.Router();

subTaskRouter.get("/get-all", getSubTasks);
subTaskRouter.get("/project/:projectId", getSubtasksByProjectId);
subTaskRouter.get("/get/:id", getSubTaskInfo);
subTaskRouter.post("/add", upload.array("media_files", 10), addSubTask);
subTaskRouter.post("/add-bulk", addBulkSubTasks);
subTaskRouter.delete("/delete/:id", deleteSubTask);
subTaskRouter.put(
  "/update/:id",
  upload.array("media_files", 10),
  updateSubTask
);
subTaskRouter.put("/complete-stage/:id", completeStage);
subTaskRouter.put("/change-status/:id", changeSubTaskStatus);
subTaskRouter.put("/change-priority/:id", changeSubTaskPriority);
subTaskRouter.get("/all-tasks-projects", getAllProjectsWithSubtasks);
subTaskRouter.put("/bulk-update", bulkUpdateSubtasks);
subTaskRouter.post("/bulk-delete", bulkDeleteSubtasks);

subTaskRouter.post("/add-comment/:subtaskId", addComment);

subTaskRouter.post(
  "/add-media/:subtaskId",
  upload.array("media_files", 10), // "media_file" must match FormData key in frontend
  addMedia
);

subTaskRouter.post("/remove-media/:subtaskId", removeMedia);

subTaskRouter.put("/subtask/start-timer/:subtaskId", startTimer);
subTaskRouter.put("/subtask/stop-timer/:subtaskId", stopTimer);

export default subTaskRouter;
