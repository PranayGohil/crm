import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import Employee from "../models/employeeModel.js";
import Client from "../models/clientModel.js";
import Admin from "../models/adminModel.js";
import Notification from "../models/notificationModel.js";
import ActivityLogger from "../utils/activityLogger.js";

import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

const FIXED_STAGE_ORDER = [
  "CAD Design",
  "SET Design",
  "Render",
  "QC",
  "Delivery",
];

function sortStages(inputStages) {
  const uniqueStages = [...new Set(inputStages)];
  return FIXED_STAGE_ORDER.filter((stage) => uniqueStages.includes(stage));
}

// Helper to get project and employee details for logging
const getRelatedInfo = async (projectId, employeeId) => {
  const related = {};

  if (projectId) {
    const project = await Project.findById(projectId);
    if (project) {
      related.project = {
        id: project._id,
        name: project.project_name
      };
    }
  }

  if (employeeId) {
    const employee = await Employee.findById(employeeId);
    if (employee) {
      related.employee = {
        id: employee._id,
        name: employee.full_name
      };
    }
  }

  return related;
};

export const addSubTask = async (req, res) => {
  try {
    const {
      project_id,
      task_name,
      description,
      url,
      priority,
      assign_date,
      due_date,
      assign_to,
      path_to_files,
      status,
    } = req.body;

    // Parse stages sent from frontend
    let rawStages = JSON.parse(req.body.stages || "[]");

    // Fetch project and client info
    const project = await Project.findById(project_id);
    let clientStagePricing = [];

    if (project?.client_id) {
      const client = await Client.findById(project.client_id);
      clientStagePricing = client?.stage_pricing || [];
    }

    // Sort stages in fixed order, then attach prices
    const sortedStageNames = sortStages(rawStages.map((s) => s.name));

    const stages = sortedStageNames.map((stageName) => {
      const incomingStage = rawStages.find((s) => s.name === stageName);
      const clientDefault = clientStagePricing.find(
        (p) => p.stage_name === stageName
      );
      const resolvedPrice =
        incomingStage?.price != null
          ? incomingStage.price
          : clientDefault?.price ?? 0;

      return {
        name: stageName,
        price: resolvedPrice,
        completed: false,
        completed_by: null,
        completed_at: null,
      };
    });

    const total_price = stages.reduce((sum, s) => sum + (s.price || 0), 0);
    const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

    const subTaskData = {
      project_id: new mongoose.Types.ObjectId(project_id),
      task_name,
      description,
      url,
      stages,
      total_price,
      earned_amount: 0,
      priority,
      assign_date,
      due_date,
      media_files: mediaFiles,
      path_to_files,
      status,
    };

    if (assign_to && mongoose.Types.ObjectId.isValid(assign_to)) {
      subTaskData.assign_to = new mongoose.Types.ObjectId(assign_to);
    }

    const subTask = await SubTask.create(subTaskData);

    // 📝 LOG ACTIVITY
    const logger = new ActivityLogger(req);
    const relatedInfo = await getRelatedInfo(project_id, assign_to);

    await logger.log('CREATE_SUBTASK', {
      entity: {
        id: subTask._id,
        name: task_name,
        type: 'subtask'
      },
      relatedTo: relatedInfo,
      metadata: {
        priority,
        status,
        stages: stages.length
      },
      description: `Created new subtask "${task_name}" for project "${project?.project_name || 'Unknown'}"`
    });

    // Rest of your existing code (notifications, etc.)
    const admin = await Admin.findOne({});
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (assign_to && connectedUsers[assign_to]) {
      const notification = await Notification.create({
        title: "New Task Assigned",
        description: `You have been assigned a new task: ${subTask.task_name}`,
        type: "new_subtask",
        icon: "",
        related_id: subTask._id,
        receiver_id: assign_to.toString(),
        receiver_type: "employee",
        created_by: admin._id,
        created_by_role: "admin",
      });
      io.to(connectedUsers[assign_to]).emit("new_subtask", notification);
    }

    res.status(200).json(subTask);
  } catch (error) {
    console.error("Error adding subtask:", error);
    res.status(500).json({ error: "Failed to add subtask" });
  }
};

// Add bulk subtasks
export const addBulkSubTasks = async (req, res) => {
  try {
    const tasks = req.body;
    console.log("Received tasks:", tasks);

    const project = await Project.findById(tasks[0].project_id);
    let clientStagePricing = [];

    if (project?.client_id) {
      const client = await Client.findById(project.client_id);
      clientStagePricing = client?.stage_pricing || [];
    }

    const tasksWithObjectIds = tasks.map((task) => {
      const parsedStages = Array.isArray(task.stages) ? task.stages : [];

      const stages = sortStages(parsedStages.map((s) => s.name)).map((stageName) => {
        const incomingStage = parsedStages.find((s) => s.name === stageName);
        const clientDefault = clientStagePricing.find(
          (p) => p.stage_name === stageName
        );
        const resolvedPrice =
          incomingStage?.price != null
            ? incomingStage.price
            : clientDefault?.price ?? 0;

        return {
          name: stageName,
          price: resolvedPrice,
          completed: false,
          completed_by: null,
          completed_at: null,
        };
      });

      const total_price = stages.reduce((sum, s) => sum + (s.price || 0), 0);

      return {
        ...task,
        project_id: new mongoose.Types.ObjectId(task.project_id),
        assign_to: task.assign_to
          ? new mongoose.Types.ObjectId(task.assign_to)
          : null,
        stages,
        total_price,
        earned_amount: 0,
      };
    });

    const result = await SubTask.insertMany(tasksWithObjectIds);

    // 📝 LOG ACTIVITY
    const logger = new ActivityLogger(req);
    const relatedInfo = await getRelatedInfo(tasks[0].project_id, tasks[0].assign_to);

    await logger.log('BULK_CREATE_SUBTASKS', {
      entity: {
        type: 'subtask'
      },
      relatedTo: relatedInfo,
      metadata: {
        count: result.length,
        taskNames: result.map(t => t.task_name).join(', ')
      },
      description: `Bulk created ${result.length} subtasks for project "${project?.project_name || 'Unknown'}"`
    });

    // ── Notifications (unchanged) ─────────────────────────────────────
    const admin = await Admin.findOne({});
    if (admin) {
      console.log("Admin found:", admin._id);
    } else {
      console.log("No admin found in the database");
    }

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (tasks[0].assign_to && connectedUsers[tasks[0].assign_to]) {
      result.forEach(async (subtask) => {
        const notification = await Notification.create({
          title: "New Task Assigned",
          description: `You have been assigned a new task: ${subtask.task_name}`,
          type: "new_subtask",
          icon: "",
          related_id: subtask._id,
          receiver_id: subtask.assign_to.toString(),
          receiver_type: "employee",
          created_by: admin?._id,
          created_by_role: "admin",
        });
        if (subtask.assign_to && connectedUsers[subtask.assign_to]) {
          io.to(connectedUsers[subtask.assign_to]).emit(
            "new_subtask",
            notification
          );
        }
      });
    }

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
    const subTask = await SubTask.findById(id)
      .populate("comments.user_id", "full_name profile_pic")
    console.log("subTask", subTask);
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
      priority,
      assign_to,
      assign_date,
      due_date,
      path_to_files,
      status,
    } = req.body;

    console.log("req.body", req.body);

    // ── Parse stages from "stages" field (frontend sends JSON string via FormData) ──
    let stageArray = [];
    if (typeof req.body.stages === "string") {
      try {
        const parsed = JSON.parse(req.body.stages);
        if (Array.isArray(parsed)) {
          stageArray = parsed.map((s) => ({
            name: s.name || s,
            price: s.price ?? 0,           // ← preserve price
            completed: s.completed || false,
            completed_by: s.completed_by || null,
            completed_at: s.completed_at || null,
          }));
        }
      } catch {
        stageArray = [];
      }
    } else if (Array.isArray(req.body.stages)) {
      stageArray = req.body.stages.map((s) => ({
        name: typeof s === "string" ? s : s.name,
        price: s.price ?? 0,               // ← preserve price
        completed: s.completed || false,
        completed_by: s.completed_by || null,
        completed_at: s.completed_at || null,
      }));
    }

    // Sort stages in fixed order
    const sortedNames = sortStages(stageArray.map((s) => s.name));
    stageArray = sortedNames.map((name) => {
      const match = stageArray.find((s) => s.name === name);
      return match || { name, price: 0, completed: false, completed_by: null, completed_at: null };
    });

    // ── Recalculate total_price from updated stage prices ──
    const total_price = stageArray.reduce((sum, s) => sum + (s.price || 0), 0);

    let updateData = {
      task_name,
      description,
      url,
      stages: stageArray,               // ← was "stage", now "stages" (matches model)
      total_price,                       // ← recalculated
      priority,
      assign_to: assign_to ? new mongoose.Types.ObjectId(assign_to) : null,
      assign_date,
      due_date,
      path_to_files,
      status,
    };

    if (req.files?.length) {
      updateData.media_files = req.files.map((file) => file.path);
    }

    const subTask = await SubTask.findById(id);

    const updated = await SubTask.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Subtask not found" });

    // 📝 LOG ACTIVITY
    const logger = new ActivityLogger(req);
    const relatedInfo = await getRelatedInfo(originalSubTask.project_id, originalSubTask.assign_to);

    // Track what changed
    const changedFields = [];
    if (originalSubTask.task_name !== updated.task_name) changedFields.push('task_name');
    if (originalSubTask.description !== updated.description) changedFields.push('description');
    if (originalSubTask.priority !== updated.priority) changedFields.push('priority');
    if (originalSubTask.status !== updated.status) changedFields.push('status');
    if (originalSubTask.assign_to?.toString() !== updated.assign_to?.toString()) changedFields.push('assignee');

    await logger.log('UPDATE_SUBTASK', {
      entity: {
        id: updated._id,
        name: updated.task_name,
        type: 'subtask'
      },
      changes: {
        before: {
          task_name: originalSubTask.task_name,
          status: originalSubTask.status,
          priority: originalSubTask.priority,
          assign_to: originalSubTask.assign_to
        },
        after: {
          task_name: updated.task_name,
          status: updated.status,
          priority: updated.priority,
          assign_to: updated.assign_to
        },
        updatedFields: changedFields
      },
      relatedTo: relatedInfo,
      description: `Updated subtask "${updated.task_name}" (changed: ${changedFields.join(', ') || 'no changes'})`
    });

    // ── Notifications (unchanged) ─────────────────────────────────────
    if (subTask.assign_to != updated.assign_to) {
      const notification_to_previous_assignee = await Notification.create({
        title: `Subtask Updated - ${subTask.task_name}`,
        description: `Your subtask has been updated: ${subTask.task_name}`,
        type: "subtask_updated",
        icon: "",
        related_id: subTask._id,
        receiver_id: subTask.assign_to || null,
        receiver_type: "employee",
      });

      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers");

      if (subTask.assign_to && connectedUsers[subTask.assign_to]) {
        io.to(connectedUsers[subTask.assign_to]).emit(
          "subtask_updated",
          notification_to_previous_assignee
        );
      }
    }

    const notification = await Notification.create({
      title: `Subtask Updated - ${updated.task_name}`,
      description: `Your subtask has been updated: ${updated.task_name}`,
      type: "subtask_updated",
      icon: "",
      related_id: subTask._id,
      receiver_id: updated.assign_to,
      receiver_type: "employee",
    });

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (updated.assign_to && connectedUsers[updated.assign_to]) {
      io.to(connectedUsers[updated.assign_to]).emit("subtask_updated", notification);
    }
    // ─────────────────────────────────────────────────────────────────

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

export const completeStage = async (req, res) => {
  try {
    const { id } = req.params;
    const subtask = await SubTask.findById(id);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    const stageIndex = subtask.current_stage_index;
    if (stageIndex >= subtask.stages.length)
      return res.status(400).json({ message: "All stages already completed" });

    // Mark current stage completed
    subtask.stages[stageIndex].completed = true;
    subtask.stages[stageIndex].completed_by = subtask.assign_to;
    subtask.stages[stageIndex].completed_at = new Date();

    // ── Update earned_amount ──────────────────────────────────────────
    const completedStagePrice = subtask.stages[stageIndex].price || 0;
    subtask.earned_amount = (subtask.earned_amount || 0) + completedStagePrice;

    // Maek Employee Status Inactive
    const employee = await Employee.findById(subtask.assign_to);
    if (employee) {
      employee.status = "Inactive";
      await employee.save();
    }

    // Move to next stage or finish
    if (stageIndex + 1 < subtask.stages.length) {
      subtask.current_stage_index = stageIndex + 1;
      subtask.status = "To Do";
      subtask.assign_to = null;
    } else {
      subtask.status = "Completed";
      subtask.assign_to = null;
    }

    const hasOpenTimer = subtask.time_logs.some((log) => !log.end_time);
    if (hasOpenTimer) {
      const lastLog = subtask.time_logs[subtask.time_logs.length - 1];
      lastLog.end_time = new Date();
      await subtask.save();
    }

    await subtask.save();

    const admin = await Admin.findOne(); // Get the first admin in the collection
    if (admin) {
      console.log("Admin found:", admin._id);
    } else {
      console.log("No admin found in the database");
    }
    const notification = await Notification.create({
      title: `${employee?.full_name} Completed a subtask ${subtask.task_name}`,
      description: `Completed a subtask: ${subtask.task_name}`,
      type: "subtask_updated",
      icon: employee?.profile_pic || null,
      related_id: subtask._id,
      receiver_id: admin._id,
      receiver_type: "admin",
      created_by: employee?._id,
      created_by_role: "employee",
    });
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (admin._id && connectedUsers[admin._id]) {
      io.to(connectedUsers[admin._id]).emit("subtask_updated", notification);
    }

    res.json(subtask);
  } catch (err) {
    console.error("Error completing stage:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete subtask
export const deleteSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const subTask = await SubTask.findById(id);
    if (!subTask) {
      return res.status(404).json({ message: "Subtask not found" });
    }
    if (subTask.status === "In Progress") {
      return res
        .status(400)
        .json({ message: "Cannot delete a subtask that is In Progress" });
    }
    await SubTask.findByIdAndDelete(id);

    // 📝 LOG ACTIVITY
    const logger = new ActivityLogger(req);
    await logger.log('DELETE_SUBTASK', {
      entity: {
        id: subTask._id,
        name: subTask.task_name,
        type: 'subtask'
      },
      relatedTo: relatedInfo,
      metadata: {
        status: subTask.status,
        priority: subTask.priority
      },
      description: `Deleted subtask "${subTask.task_name}"`,
      severity: 'warning'
    });

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
        subtask.time_logs.push({
          user_id: subtask.assign_to,
          start_time: new Date(),
        });
      }
    } else {
      subtask.time_logs = subtask.time_logs.map((log) => {
        if (!log.end_time) {
          log.end_time = new Date();
        }
        return log;
      });
    }

    // ✅ Update subtask status
    subtask.status = status;
    await subtask.save();

    // 📝 LOG ACTIVITY (only if admin changed it)
    if (userRole === "admin") {
      const logger = new ActivityLogger(req);
      const relatedInfo = await getRelatedInfo(subtask.project_id, subtask.assign_to);

      await logger.log('CHANGE_SUBTASK_STATUS', {
        entity: {
          id: subtask._id,
          name: subtask.task_name,
          type: 'subtask'
        },
        changes: {
          before: { status: oldStatus },
          after: { status }
        },
        relatedTo: relatedInfo,
        description: `Changed subtask "${subtask.task_name}" status from "${oldStatus}" to "${status}"`
      });
    }

    // ✅ Update employee status based on subtask state
    if (userRole === "employee" && subtask.assign_to) {
      const assignedEmployee = await Employee.findById(subtask.assign_to);
      if (assignedEmployee) {
        if (status === "In Progress") {
          assignedEmployee.status = "Active";
        } else {
          // Check if any other subtask is still in progress
          const otherActiveTask = await SubTask.findOne({
            assign_to: subtask.assign_to,
            status: "In Progress",
          });
          if (!otherActiveTask) {
            assignedEmployee.status = "Inactive";
          }
        }
        await assignedEmployee.save();
      }
    }

    // ✅ Send notification
    const project = await Project.findById(subtask.project_id);
    const userWhoChanged = await (userRole === "admin"
      ? Admin.findById(userId)
      : Employee.findById(userId));

    const userName =
      userWhoChanged?.full_name || userWhoChanged?.username || "Someone";

    if (userRole === "employee") {
      const admin = await Admin.findOne(); // Get the first admin in the collection
      if (admin) {
        console.log("Admin found:", admin._id);
      } else {
        console.log("No admin found in the database");
      }
      const notification = await Notification.create({
        title: `${userName} updated status of subtask ${subtask.task_name} to ${status}`,
        description: `Status changed to ${status}`,
        type: "subtask_updated",
        icon: userWhoChanged?.profile_pic || null,
        related_id: subtask._id,
        receiver_id: admin._id,
        receiver_type: "admin",
        created_by: userId,
        created_by_role: userRole,
      });
      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers");

      if (admin._id && connectedUsers[admin._id]) {
        io.to(connectedUsers[admin._id]).emit("subtask_updated", notification);
      }
    }

    if (userRole === "admin" && subtask.assign_to) {
      const notification = await Notification.create({
        title: `${subtask.task_name} status changed to ${status} by Admin`,
        description: `${userName} updated status of your subtask '${subtask.task_name}' to ${status}`,
        type: "subtask_updated",
        related_id: subtask._id,
        receiver_id: subtask.assign_to,
        receiver_type: "employee",
        created_by: userId,
        created_by_role: userRole,
      });

      const io = req.app.get("io");
      const connectedUsers = req.app.get("connectedUsers");

      if (subtask.assign_to && connectedUsers[subtask.assign_to]) {
        io.to(connectedUsers[subtask.assign_to]).emit(
          "subtask_updated",
          notification
        );
      }
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
    console.log("Bulk updating subtasks:", ids, update);

    // 1️⃣ Get subtasks before update
    const updatedTasks = await SubTask.find({ _id: { $in: ids } });
    console.log("Found subtasks to update:", updatedTasks);

    // 2️⃣ Update them
    await SubTask.updateMany({ _id: { $in: ids } }, { $set: update });

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    // 3️⃣ Loop through each task to send notifications
    for (const task of updatedTasks) {
      const oldAssigneeId = task.assign_to ? task.assign_to.toString() : null;
      const newAssigneeId = update.assign_to
        ? update.assign_to.toString()
        : null;

      // 📢 Notify old assignee (if exists)
      if (oldAssigneeId && connectedUsers[oldAssigneeId]) {
        const oldNotification = await Notification.create({
          title: `Subtask Updated - ${task.task_name}`,
          description: `You are no longer assigned to subtask: ${task.task_name}`,
          type: "subtask_updated",
          icon: "/SVG/task-com-vec.svg",
          related_id: task._id,
          receiver_id: oldAssigneeId,
          receiver_type: "employee",
        });
        io.to(connectedUsers[oldAssigneeId]).emit(
          "subtask_updated",
          oldNotification
        );
      }

      // 📢 Notify new assignee (if different from old)
      if (
        newAssigneeId &&
        newAssigneeId !== oldAssigneeId &&
        connectedUsers[newAssigneeId]
      ) {
        const newNotification = await Notification.create({
          title: `Subtask Updated - ${task.task_name}`,
          description: `You have been assigned a new subtask: ${task.task_name}`,
          type: "subtask_updated",
          icon: "/SVG/task-com-vec.svg",
          related_id: task._id,
          receiver_id: newAssigneeId,
          receiver_type: "employee",
        });
        io.to(connectedUsers[newAssigneeId]).emit(
          "subtask_updated",
          newNotification
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error bulk updating subtasks:", error);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

// Bulk delete subtasks
export const bulkDeleteSubtasks = async (req, res) => {
  try {
    const { ids } = req.body;

    // Find subtasks first
    const subtasks = await SubTask.find({ _id: { $in: ids } });

    if (!subtasks || subtasks.length === 0) {
      return res.status(404).json({ message: "No subtasks found" });
    }

    // Check if any subtask is in progress
    const inProgressTask = subtasks.find(
      (task) => task.status === "In Progress"
    );
    if (inProgressTask) {
      return res.status(400).json({
        message: "Cannot delete. One or more subtasks are In Progress.",
      });
    }

    // If all are safe, delete them
    const result = await SubTask.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: "Subtasks deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting subtasks:", error);
    res.status(500).json({ error: "Bulk delete failed" });
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

    console.log("Updated subtask with new comment:", updated);

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (user_type === "employee") {
      const admin = await Admin.findOne();
      if (admin) {
        console.log("Admin found:", admin._id);
      } else {
        console.log("No admin found in the database");
      }
      const adminNotification = await Notification.create({
        title: `New Comment on Subtask ${updated.task_name}`,
        description: `${updated.comments[updated.comments.length - 1].user_id.full_name
          } commented: ${text}`,
        type: "comment",
        icon: "/SVG/comment-vec.svg",
        related_id: subtaskId,
        receiver_id: admin._id,
        receiver_type: "admin",
        created_by: user_id,
        created_by_role: "employee",
      });
      if (admin._id && connectedUsers[admin._id]) {
        io.to(connectedUsers[admin._id]).emit("comment", adminNotification);
      }
    } else {
      // Notify the employee about the new comment
      const employeeNotification = await Notification.create({
        title: `New Comment on Subtask ${updated.task_name}`,
        description: `Admin commented: ${text}`,
        type: "comment",
        icon: "/SVG/comment-vec.svg",
        related_id: subtaskId,
        receiver_id: updated.assign_to,
        receiver_type: "employee",
        created_by: user_id,
        created_by_role: "admin",
      });
      if (updated.assign_to && connectedUsers[updated.assign_to]) {
        io.to(connectedUsers[updated.assign_to]).emit(
          "comment",
          employeeNotification
        );
      }
    }

    res.json({ success: true, comments: updated.comments });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addMedia = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const files = req.files;
    const userType = req.body.user_type; // "admin" or "employee"

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Find subtask
    const subtask = await SubTask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    const Assignee = await Employee.findById(subtask.assign_to);

    // Add all uploaded file URLs
    const newUrls = files.map((file) => file.path); // file.path is Cloudinary URL
    subtask.media_files.push(...newUrls);

    await subtask.save();

    const admin = await Admin.findOne();
    if (admin) {
      console.log("Admin found:", admin._id);
    } else {
      console.log("No admin found in the database");
    }

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (userType === "employee") {
      const adminNotification = await Notification.create({
        title: `New Media File Added on Subtask ${subtask.task_name}`,
        description: `${Assignee?.full_name} added media files`,
        type: "media_upload",
        icon: "/SVG/media-vec.svg",
        related_id: subtaskId,
        receiver_id: admin._id,
        receiver_type: "admin",
        created_by: subtask.assign_to,
        created_by_role: "employee",
      });
      if (admin._id && connectedUsers[admin._id]) {
        io.to(connectedUsers[admin._id]).emit(
          "media_upload",
          adminNotification
        );
      }
    } else {
      const employeeNotification = await Notification.create({
        title: `New Media File Added on Subtask ${subtask.task_name}`,
        description: `Admin added media files`,
        type: "media_upload",
        icon: "/SVG/media-vec.svg",
        related_id: subtaskId,
        receiver_id: Assignee._id,
        receiver_type: "employee",
        created_by: admin._id,
        created_by_role: "admin",
      });
      if (Assignee._id && connectedUsers[Assignee._id]) {
        io.to(connectedUsers[Assignee._id]).emit(
          "media_upload",
          employeeNotification
        );
      }
    }

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
    const { mediaUrl, user_type, user_id } = req.body;

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

    const Assignee = await Employee.findById(subtask.assign_to);

    const admin = await Admin.findOne();
    if (admin) {
      console.log("Admin found:", admin._id);
    } else {
      console.log("No admin found in the database");
    }

    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (user_type === "employee") {
      const adminNotification = await Notification.create({
        title: `Media File Deleted on Subtask ${subtask.task_name}`,
        description: `${Assignee?.full_name} delete media files`,
        type: "media_upload",
        icon: "/SVG/media-vec.svg",
        related_id: subtaskId,
        receiver_id: admin._id,
        receiver_type: "admin",
        created_by: subtask.assign_to,
        created_by_role: "employee",
      });
      if (admin._id && connectedUsers[admin._id]) {
        io.to(connectedUsers[admin._id]).emit(
          "media_upload",
          adminNotification
        );
      }
    } else {
      const employeeNotification = await Notification.create({
        title: `Media File Deleted on Subtask ${subtask.task_name}`,
        description: `Admin delete media files`,
        description: `Admin delete media files`,
        type: "media_upload",
        icon: "/SVG/media-vec.svg",
        related_id: subtaskId,
        receiver_id: Assignee._id,
        receiver_type: "employee",
        created_by: admin._id,
        created_by_role: "admin",
      });
      if (Assignee._id && connectedUsers[Assignee._id]) {
        io.to(connectedUsers[Assignee._id]).emit(
          "media_upload",
          employeeNotification
        );
      }
    }

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

