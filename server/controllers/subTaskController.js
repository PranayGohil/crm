import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import Employee from "../models/employeeModel.js";
import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";

import Notification from "../models/notificationModel.js";
import { io } from "../utils/socket.js";

// Add a single subtask
export const addSubTask = async (req, res) => {
  try {
    const {
      project_id,
      task_name,
      description,
      url,
      stage,
      priority,
      assign_date,
      due_date,
      assign_to,
      path_to_files,
      status,
    } = req.body;

    const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

    const subTask = await SubTask.create({
      project_id: new mongoose.Types.ObjectId(project_id),
      task_name,
      description,
      url,
      stage,
      priority,
      assign_to: new mongoose.Types.ObjectId(assign_to),
      assign_date,
      due_date,
      media_files: mediaFiles,
      path_to_files,
      status,
    });

    res.status(200).json(subTask);
  } catch (error) {
    console.error("Error adding subtask:", error);
    res.status(500).json({ error: "Failed to add subtask" });
  }
};

// Add bulk subtasks
export const addBulkSubTasks = async (req, res) => {
  try {
    const tasks = req.body; // array

    const tasksWithObjectIds = tasks.map((task) => ({
      ...task,
      project_id: new mongoose.Types.ObjectId(task.project_id),
      assign_to: task.assign_to
        ? new mongoose.Types.ObjectId(task.assign_to)
        : null,
    }));

    const result = await SubTask.insertMany(tasksWithObjectIds);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding bulk subtasks:", error);
    res.status(500).json({ error: "Failed to add subtasks" });
  }
};

// Get all subtasks
export const getSubTasks = async (req, res) => {
  try {
    const subTasks = await SubTask.find();
    res.status(200).json(subTasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Failed to get subtasks" });
  }
};

// Get subtasks by project ID
export const getSubtasksByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const subtasks = await SubTask.find({ project_id: projectId });
    res.status(200).json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Failed to get subtasks" });
  }
};

// Get single subtask by ID
export const getSubTaskInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const subTask = await SubTask.findById(id).populate(
      "comments.user_id",
      "full_name profile_pic"
    ); // populate commenter info

    if (!subTask) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    res.status(200).json(subTask);
  } catch (error) {
    console.error("Error fetching subtask:", error);
    res.status(500).json({ error: "Failed to get subtask" });
  }
};

// Update subtask
export const updateSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      task_name,
      description,
      url,
      stage,
      priority,
      assign_to,
      assign_date,
      due_date,
      path_to_files,
      status,
    } = req.body;

    let updateData = {
      task_name,
      description,
      url,
      stage,
      priority,
      assign_to: assign_to ? new mongoose.Types.ObjectId(assign_to) : null,
      assign_date,
      due_date,
      path_to_files,
      status,
    };

    // update media files if uploaded
    if (req.files && req.files.length > 0) {
      updateData.media_files = req.files.map((file) => file.path);
    }

    const updated = await SubTask.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.json({
      success: true,
      message: "Subtask updated successfully!",
      subTask: updated,
    });
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

// Delete subtask
export const deleteSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const subTask = await SubTask.findByIdAndDelete(id);
    if (!subTask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    res.status(500).json({ message: "Failed to delete subtask" });
  }
};

// Change subtask status
export const changeSubTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId, userRole } = req.body;
    console.log("Changing status for subtask:", id, "to", status);

    const subtask = await SubTask.findById(id);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    // ⛔️ Prevent multiple running tasks for employee
    if (status === "In Progress" && userRole === "employee") {
      const existingRunningTask = await SubTask.findOne({
        assign_to: userId,
        status: "In Progress",
        _id: { $ne: id }, // Exclude current task
      });

      if (existingRunningTask) {
        return res.status(400).json({
          message: `You already have a task "${existingRunningTask.task_name}" in progress.`,
        });
      }
    }

    // ✅ Handle time logs
    if (status === "In Progress") {
      const hasOpenTimer = subtask.time_logs.some((log) => !log.end_time);
      if (!hasOpenTimer) {
        subtask.time_logs.push({ start_time: new Date() });
      }
    } else {
      subtask.time_logs = subtask.time_logs.map((log) => {
        if (!log.end_time) log.end_time = new Date();
        return log;
      });
    }

    // ✅ Update status
    subtask.status = status;
    await subtask.save();

    // ✅ Send notification
    const project = await Project.findById(subtask.project_id);
    const userWhoChanged = await (userRole === "admin"
      ? Admin.findById(userId)
      : Employee.findById(userId));

    const userName = userWhoChanged?.full_name || "Someone";

    if (userRole === "employee") {
      await Notification.create({
        title: `${userName} updated status of subtask ${subtask.task_name} to ${status}`,
        description: `Status changed to ${status}`,
        type: "task_update",
        icon: userWhoChanged?.profile_pic || null,
        related_id: subtask._id,
        receiver_id: "admin",
        receiver_type: "admin",
        created_by: userId,
        created_by_role: userRole,
      });
    }

    if (userRole === "admin" && subtask.assign_to) {
      await Notification.create({
        title: `Status changed to ${status}`,
        description: `${userName} updated status of your subtask '${subtask.task_name}' to ${status}`,
        type: "task_update",
        related_id: subtask._id,
        receiver_id: subtask.assign_to,
        receiver_type: "employee",
        created_by: userId,
        created_by_role: userRole,
      });
    }

    console.log("Notification sent successfully");
    res.status(200).json(subtask);
  } catch (error) {
    console.error("Error changing subtask status:", error);
    res.status(500).json({ error: "Failed to change status" });
  }
};

// Change subtask priority
export const changeSubTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const updated = await SubTask.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error changing subtask priority:", error);
    res.status(500).json({ error: "Failed to change priority" });
  }
};

// Bulk update subtasks
export const bulkUpdateSubtasks = async (req, res) => {
  try {
    const { ids, update } = req.body;
    const result = await SubTask.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );
    res.json(result);
  } catch (error) {
    console.error("Error bulk updating subtasks:", error);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

// Bulk delete subtasks
export const bulkDeleteSubtasks = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await SubTask.deleteMany({ _id: { $in: ids } });
    res.json(result);
  } catch (error) {
    console.error("Error bulk deleting subtasks:", error);
    res.status(500).json({ error: "Bulk delete failed" });
  }
};

// Get all projects with attached subtasks
export const getAllProjectsWithSubtasks = async (req, res) => {
  try {
    const projects = await Project.find().lean();

    const projectIds = projects.map((p) => p._id.toString());
    const subtasks = await SubTask.find({
      project_id: { $in: projectIds },
    }).lean();

    // group subtasks by project_id
    const subtasksByProject = subtasks.reduce((acc, subtask) => {
      if (!acc[subtask.project_id]) acc[subtask.project_id] = [];
      acc[subtask.project_id].push(subtask);
      return acc;
    }, {});

    const projectsWithSubtasks = projects.map((project) => ({
      ...project,
      subtasks: subtasksByProject[project._id.toString()] || [],
    }));

    res.json(projectsWithSubtasks);
  } catch (error) {
    console.error("Error fetching projects with subtasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addComment = async (req, res) => {
  const { subtaskId } = req.params;
  const { user_id, user_type, text } = req.body;
  console.log("Adding comment to subtask:", subtaskId);

  if (!text || !user_type) {
    console.error("Missing text or user_type");
    return res
      .status(400)
      .json({ success: false, message: "Missing text or user_type" });
  }

  // Validate user_type
  if (!["admin", "employee"].includes(user_type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user_type" });
  }

  // if user_type is Employee, user_id must be present
  if (user_type === "employee" && !user_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing user_id for employee" });
  }

  try {
    // build comment object dynamically
    const comment = {
      user_type,
      text,
      created_at: new Date(),
    };

    if (user_type === "employee") {
      comment.user_id = user_id;
    }

    const updated = await SubTask.findByIdAndUpdate(
      subtaskId,
      { $push: { comments: comment } },
      { new: true }
    ).populate({
      path: "comments.user_id",
      select: "full_name profile_pic",
    });

    res.json({ success: true, comments: updated.comments });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addMedia = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const files = req.files; // array of uploaded files

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Find subtask
    const subtask = await SubTask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Add all uploaded file URLs
    const newUrls = files.map((file) => file.path); // file.path is Cloudinary URL
    subtask.media_files.push(...newUrls);

    await subtask.save();

    return res.status(200).json({
      message: "Media added successfully",
      media_files: subtask.media_files,
    });
  } catch (error) {
    console.error("Error adding media:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeMedia = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { mediaUrl } = req.body;

    const subtask = await SubTask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Remove from Cloudinary
    const segments = mediaUrl.split("/");
    const filenameWithExt = segments[segments.length - 1];
    const publicIdWithoutExt = filenameWithExt.split(".")[0]; // remove extension

    const folderSegments = segments.slice(
      segments.findIndex((s) => s === "crm")
    );
    const publicId = folderSegments.join("/").replace(/\.[^/.]+$/, ""); // remove extension

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

    // Remove from subtask media_files
    subtask.media_files = subtask.media_files.filter((url) => url !== mediaUrl);
    await subtask.save();

    res.status(200).json({
      message: "Media removed successfully",
      media_files: subtask.media_files,
    });
  } catch (error) {
    console.error("Error removing media:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Start timer
export const startTimer = async (req, res) => {
  const { subtaskId } = req.params;
  try {
    const subtask = await SubTask.findById(subtaskId);
    subtask.time_logs.push({ start_time: new Date(), end_time: null });
    await subtask.save();
    res.json({ message: "Timer started", subtask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start timer" });
  }
};

// Stop timer
export const stopTimer = async (req, res) => {
  const { subtaskId } = req.params;
  try {
    const subtask = await SubTask.findById(subtaskId);
    const lastLog = subtask.time_logs.find((log) => log.end_time === null);
    if (lastLog) {
      lastLog.end_time = new Date();
      await subtask.save();
      res.json({ message: "Timer stopped", subtask });
    } else {
      res.status(400).json({ message: "No running timer found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to stop timer" });
  }
};
