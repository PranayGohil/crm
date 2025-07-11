import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import mongoose from "mongoose";

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
      path_to_files,
      status,
    } = req.body;

    let asign_to = req.body.asign_to;
    if (typeof asign_to === "string") {
      asign_to = JSON.parse(asign_to);
    }

    // Convert project_id to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(project_id);

    // Convert asign_to[].id to ObjectId
    asign_to = asign_to.map((a) => ({
      role: a.role,
      id: new mongoose.Types.ObjectId(a.id),
    }));

    const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

    const subTask = await SubTask.create({
      project_id: projectObjectId,
      task_name,
      description,
      stage,
      priority,
      asign_to,
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

export const addBulkSubTasks = async (req, res) => {
  try {
    const tasks = req.body; // array

    const tasksWithObjectIds = tasks.map((task) => ({
      ...task,
      project_id: new mongoose.Types.ObjectId(task.project_id),
      asign_to: task.asign_to.map((a) => ({
        role: a.role,
        id: new mongoose.Types.ObjectId(a.id),
      })),
    }));

    const result = await SubTask.insertMany(tasksWithObjectIds);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding bulk subtasks:", error);
    res.status(500).json({ error: "Failed to add subtasks" });
  }
};

export const getSubTasks = async (req, res) => {
  const subTasks = await SubTask.find();
  res.status(200).json(subTasks);
};

export const getSubtasksByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const subtasks = await SubTask.find({ project_id: projectId }); // assuming you have project_id field
    res.status(200).json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Failed to get subtasks" });
  }
};

export const getSubTaskInfo = async (req, res) => {
  const { id } = req.params;
  const subTask = await SubTask.findById(id);
  res.status(200).json(subTask);
};

export const updateSubTask = async (req, res) => {
  const { id } = req.params;
  const subTask = await SubTask.findByIdAndUpdate(id, req.body);
  res.status(200).json(subTask);
};

export const deleteSubTask = async (req, res) => {
  const { id } = req.params;
  const subTask = await SubTask.findByIdAndDelete(id);
  res.status(200).json(subTask);
};

export const changeSubTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const subTask = await SubTask.findByIdAndUpdate(id, { status });
  res.status(200).json(subTask);
};

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

    // attach subtasks to each project
    const projectsWithSubtasks = projects.map((project) => ({
      ...project,
      subtasks: subtasksByProject[project._id.toString()] || [],
    }));

    res.json(projectsWithSubtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bulkUpdateSubtasks = async (req, res) => {
  const { ids, update } = req.body;
  try {
    const result = await SubTask.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

export const bulkDeleteSubtasks = async (req, res) => {
  const { ids } = req.body;
  try {
    const result = await SubTask.deleteMany({ _id: { $in: ids } });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bulk delete failed" });
  }
};
