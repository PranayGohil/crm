import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import mongoose from "mongoose";

// Add a single subtask
export const addSubTask = async (req, res) => {
  try {
    const {
      project_id,
      task_name,
      description,
      stage,
      priority,
      assign_date,
      due_date,
      asign_to,
      path_to_files,
      status,
    } = req.body;

    const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

    const subTask = await SubTask.create({
      project_id: new mongoose.Types.ObjectId(project_id),
      task_name,
      description,
      stage,
      priority,
      asign_to: new mongoose.Types.ObjectId(asign_to),
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
      asign_to: task.asign_to
        ? new mongoose.Types.ObjectId(task.asign_to)
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
    const subTask = await SubTask.findById(id);
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
      stage,
      priority,
      asign_to,
      assign_date,
      due_date,
      path_to_files,
      status,
    } = req.body;

    let updateData = {
      task_name,
      description,
      stage,
      priority,
      asign_to: asign_to ? new mongoose.Types.ObjectId(asign_to) : null,
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
    const { status } = req.body;

    const updated = await SubTask.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json(updated);
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
