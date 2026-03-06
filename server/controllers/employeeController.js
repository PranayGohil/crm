import Employee from "../models/employeeModel.js";
import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import Designation from "../models/designationModel.js";
import ActivityLogger from "../utils/activityLogger.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper — builds a { $gte, $lte } date filter from query params
// range: all | today | week | month | custom
// from / to: ISO date strings (used when range=custom)
// ─────────────────────────────────────────────────────────────────────────────
export const buildDateRange = ({ range, from, to }) => {
  const now = new Date();
  switch (range) {
    case "today": {
      const s = new Date(now); s.setHours(0, 0, 0, 0);
      const e = new Date(now); e.setHours(23, 59, 59, 999);
      return { $gte: s, $lte: e };
    }
    case "week": {
      const s = new Date(now);
      s.setDate(now.getDate() - now.getDay());
      s.setHours(0, 0, 0, 0);
      return { $gte: s };
    }
    case "month": {
      return { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    }
    case "custom": {
      const filter = {};
      if (from) filter.$gte = new Date(from);
      if (to) { const e = new Date(to); e.setHours(23, 59, 59, 999); filter.$lte = e; }
      return Object.keys(filter).length ? filter : null;
    }
    default:
      return null; // all time
  }
};

export const checkUsernameAvailability = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const username = req.body.username;
    console.log("username", username);
    const existingUser = await Employee.findOne({ username });
    if (existingUser) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (err) {
    console.error("Error checking username", err);
    res.status(500).json({ available: false });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const {
      username,
      password,
      full_name,
      designation,
      phone,
      email,
      home_address,
      dob,
      emergency_contact,
      capacity,
      department,
      date_of_joining,
      monthly_salary,
      employment_type,
      reporting_manager,
      manage_stages,
      is_manager,
    } = req.body;

    // check if username already exists
    const existingUser = await Employee.findOne({ username });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Username already exists. Please choose another.",
      });
    }

    const newEmployee = new Employee({
      username,
      password,
      full_name,
      designation,
      status: "Inactive",
      profile_pic: req.file ? req.file.path : null,
      phone,
      email,
      home_address,
      dob,
      emergency_contact,
      capacity,
      department,
      date_of_joining,
      monthly_salary,
      employment_type,
      reporting_manager: reporting_manager
        ? new mongoose.Types.ObjectId(reporting_manager) // 👈 ensure it’s saved as ObjectId
        : null,
      is_manager,
      manage_stages: is_manager ? manage_stages || [] : [],
    });

    await newEmployee.save();

    // 📝 LOG ACTIVITY - Admin created a new employee
    const logger = new ActivityLogger(req);

    // Get reporting manager info for logging
    let reportingManagerName = null;
    if (reporting_manager) {
      const manager = await Employee.findById(reporting_manager).select('full_name');
      reportingManagerName = manager?.full_name;
    }

    await logger.log('CREATE_EMPLOYEE', {
      entity: {
        id: newEmployee._id,
        name: full_name,
        type: 'employee'
      },
      changes: {
        after: {
          username,
          full_name,
          designation,
          department,
          is_manager: !!is_manager,
          reporting_manager: reportingManagerName
        }
      },
      metadata: {
        designation,
        department,
        isManager: !!is_manager,
        hasProfilePic: !!req.file
      },
      description: `Created new employee "${full_name}" (${designation || 'No designation'})`,
      severity: 'info'
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find employee by username
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare password
    let isMatch = false;
    if (password === employee.password) {
      isMatch = true;
    } else {
      isMatch = false;
    }
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: employee._id, role: "employee" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return response (don't send password)
    res.json({
      _id: employee._id,
      username: employee.username,
      full_name: employee.full_name,
      email: employee.email,
      is_manager: employee.is_manager,

      token,
      role: "employee",
    });
  } catch (error) {
    console.error("Employee login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(
      {},
      "_id full_name email status designation department phone monthly_salary profile_pic is_manager reporting_manager"
    ).populate("reporting_manager", "full_name _id");
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const getMultipleEmployees = async (req, res) => {
  try {
    const ids = req.query.ids?.split(",");
    if (!ids || ids.length === 0) return res.json([]);
    const employees = await Employee.find({ _id: { $in: ids } });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

export const getEmployeeInfo = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("reporting_manager", "full_name")
      .lean(); // plain JS object — faster, no .toObject() needed downstream

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("getEmployeeInfo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      password,
      full_name,
      designation,
      status,
      phone,
      email,
      home_address,
      dob,
      emergency_contact,
      capacity,
      department,
      date_of_joining,
      monthly_salary,
      employment_type,
      reporting_manager,
      is_manager,
      manage_stages,
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Store original values for logging
    const originalValues = {
      username: employee.username,
      full_name: employee.full_name,
      designation: employee.designation,
      status: employee.status,
      department: employee.department,
      is_manager: employee.is_manager,
      reporting_manager: employee.reporting_manager,
      monthly_salary: employee.monthly_salary
    };

    // Check username uniqueness
    if (username && username !== employee.username) {
      const existingUser = await Employee.findOne({ username });
      if (existingUser) {
        return res.json({
          success: false,
          message: "Username already exists. Please choose another.",
        });
      }
      employee.username = username;
    }

    // Update fields
    employee.password = password || employee.password;
    employee.full_name = full_name || employee.full_name;
    employee.designation = designation || employee.designation;
    employee.status = status || employee.status;
    employee.phone = phone || employee.phone;
    employee.email = email || employee.email;
    employee.home_address = home_address || employee.home_address;
    employee.dob = dob ? new Date(dob) : employee.dob;
    employee.emergency_contact = emergency_contact || employee.emergency_contact;
    employee.capacity = capacity || employee.capacity;
    employee.department = department || employee.department;
    employee.date_of_joining = date_of_joining ? new Date(date_of_joining) : employee.date_of_joining;
    employee.monthly_salary = monthly_salary || employee.monthly_salary;
    employee.employment_type = employment_type || employee.employment_type;

    // Reporting manager
    if (reporting_manager) {
      employee.reporting_manager = reporting_manager;
    }

    // is_manager conversion
    if (typeof is_manager !== "undefined") {
      employee.is_manager = typeof is_manager === "string" ? is_manager === "true" : !!is_manager;
    }
    employee.manage_stages = employee.is_manager ? manage_stages || [] : [];

    // Profile pic
    if (req.file) {
      employee.profile_pic = req.file.path;
    }

    await employee.save();

    // 📝 LOG ACTIVITY - Admin updated an employee
    const logger = new ActivityLogger(req);

    // Track what changed
    const changedFields = [];
    const changes = { before: {}, after: {} };

    if (originalValues.full_name !== employee.full_name) {
      changedFields.push('full_name');
      changes.before.full_name = originalValues.full_name;
      changes.after.full_name = employee.full_name;
    }
    if (originalValues.designation !== employee.designation) {
      changedFields.push('designation');
      changes.before.designation = originalValues.designation;
      changes.after.designation = employee.designation;
    }
    if (originalValues.status !== employee.status) {
      changedFields.push('status');
      changes.before.status = originalValues.status;
      changes.after.status = employee.status;
    }
    if (originalValues.department !== employee.department) {
      changedFields.push('department');
      changes.before.department = originalValues.department;
      changes.after.department = employee.department;
    }
    if (originalValues.is_manager !== employee.is_manager) {
      changedFields.push('is_manager');
      changes.before.is_manager = originalValues.is_manager;
      changes.after.is_manager = employee.is_manager;
    }
    if (originalValues.reporting_manager?.toString() !== employee.reporting_manager?.toString()) {
      changedFields.push('reporting_manager');

      // Get manager names for better logging
      if (originalValues.reporting_manager) {
        const oldManager = await Employee.findById(originalValues.reporting_manager).select('full_name');
        changes.before.reporting_manager = oldManager?.full_name || originalValues.reporting_manager;
      }
      if (employee.reporting_manager) {
        const newManager = await Employee.findById(employee.reporting_manager).select('full_name');
        changes.after.reporting_manager = newManager?.full_name || employee.reporting_manager;
      }
    }
    if (originalValues.monthly_salary !== employee.monthly_salary) {
      changedFields.push('monthly_salary');
      changes.before.monthly_salary = originalValues.monthly_salary;
      changes.after.monthly_salary = employee.monthly_salary;
    }
    if (req.file) {
      changedFields.push('profile_pic');
    }

    await logger.log('UPDATE_EMPLOYEE', {
      entity: {
        id: employee._id,
        name: employee.full_name,
        type: 'employee'
      },
      changes: {
        before: changes.before,
        after: changes.after,
        updatedFields: changedFields
      },
      metadata: {
        hasPasswordChange: !!password,
        hasProfilePicChange: !!req.file
      },
      description: `Updated employee "${employee.full_name}" (changed: ${changedFields.join(', ') || 'no changes'})`,
      severity: changedFields.length > 0 ? 'info' : 'warning'
    });

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Get employee before deletion for logging
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Check if employee has active tasks
    const activeTasks = await SubTask.findOne({
      assign_to: id,
      status: "In Progress"
    });

    if (activeTasks) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete employee with active tasks. Please reassign or complete their tasks first."
      });
    }

    await Employee.findByIdAndDelete(id);

    // 📝 LOG ACTIVITY - Admin deleted an employee
    const logger = new ActivityLogger(req);

    await logger.log('DELETE_EMPLOYEE', {
      entity: {
        id: employee._id,
        name: employee.full_name,
        type: 'employee'
      },
      metadata: {
        username: employee.username,
        designation: employee.designation,
        department: employee.department,
        wasManager: employee.is_manager
      },
      description: `Deleted employee "${employee.full_name}" (${employee.designation || 'No designation'})`,
      severity: 'warning'
    });

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const subtasks = await SubTask.find({
      $or: [{ assign_to: employeeId }, { "stages.completed_by": employeeId }],
    }).populate("project_id");

    res.json(subtasks);
  } catch (error) {
    console.error("Error fetching employee subtasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEmployeeDashboardData = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const empObjId = new mongoose.Types.ObjectId(employeeId);

    // ── Date range ────────────────────────────────────────────────────
    const start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const skip = (Number(page) - 1) * Number(limit);

    // ── 1. Single query replacing two separate finds + JS dedup ───────
    //
    // Before:
    //   const assignedSubtasks = await SubTask.find({ assign_to: employeeId })
    //   const stageSubtasks    = await SubTask.find({ "stages.completed_by": employeeId })
    //   let allSubtasks = [...assignedSubtasks, ...stageSubtasks.filter(dedup)]
    //   const projects  = await Project.find({ _id: { $in: uniqueProjectIds } })
    //
    // After: one query, projects already populated
    const allSubtasks = await SubTask.find({
      $or: [
        { assign_to: empObjId },
        { "stages.completed_by": empObjId },
      ],
    })
      .populate("project_id", "project_name status priority assign_date due_date client_id")
      .lean(); // lean = plain JS objects, no Mongoose overhead

    // ── 2. Compute global stats across ALL subtasks (not paginated) ───
    //
    // completedCount + timeLogged must always reflect the full date range,
    // not just the current page — so we loop everything once here.
    let totalMs = 0;
    let completedCount = 0;

    allSubtasks.forEach((task) => {
      // Completed stages by this employee within date range
      task.stages.forEach((stage) => {
        if (!stage.completed || stage.completed_by?.toString() !== employeeId) return;
        if (!start) { completedCount++; return; }
        const completedAt = new Date(stage.completed_at);
        if (completedAt >= start && completedAt <= end) completedCount++;
      });

      // Time logs within date range
      (task.time_logs ?? []).forEach((log) => {
        if (log.user_id?.toString() !== employeeId) return;

        const logStart = new Date(log.start_time);
        const logEnd = log.end_time ? new Date(log.end_time) : new Date();

        if (start && logEnd < start) return; // log entirely before window
        if (end && logStart > end) return; // log entirely after window

        const effectiveStart = start && logStart < start ? start : logStart;
        const effectiveEnd = end && logEnd > end ? end : logEnd;
        totalMs += effectiveEnd - effectiveStart;
      });
    });

    const hours = Math.floor(totalMs / 3_600_000);
    const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
    const seconds = Math.floor((totalMs % 60_000) / 1_000);
    const timeLogged = `${hours}h ${minutes}m ${seconds}s`;

    // ── 3. Enrich subtasks with employee-specific computed fields ─────
    //
    // Same logic as before, but using .lean() objects so no .toObject() needed
    const enrichedSubtasks = allSubtasks.map((task) => {
      const employeeStages = task.stages
        .filter((st) => st.completed_by?.toString() === employeeId)
        .map((st) => st.name);

      const isCurrentStageAssignedToEmployee =
        task.assign_to?.toString() === employeeId;

      return {
        ...task,
        employeeCompletedStages: employeeStages,
        completedByEmployee: employeeStages.length > 0,
        currentStageAssignedToEmployee: isCurrentStageAssignedToEmployee,
      };
    });

    // ── 4. Group by project, deduplicate projects ─────────────────────
    //
    // Before: Project.find() was a separate DB call.
    // Now: project data comes from the populated project_id field.
    const projectMap = new Map(); // projectId → { project, subtasks[] }

    enrichedSubtasks.forEach((task) => {
      const proj = task.project_id;
      if (!proj) return;

      const pid = proj._id.toString();
      if (!projectMap.has(pid)) {
        projectMap.set(pid, { project: proj, subtasks: [] });
      }
      projectMap.get(pid).subtasks.push(task);
    });

    const allProjectEntries = [...projectMap.values()];

    // ── 5. Paginate at project level ──────────────────────────────────
    const totalProjects = allProjectEntries.length;
    const paginatedEntries = allProjectEntries.slice(skip, skip + Number(limit));

    // Shape the response the same way the frontend expects:
    // projects[]  — the project objects for this page
    // subtasks[]  — only subtasks belonging to this page's projects
    const pageProjects = paginatedEntries.map((e) => e.project);
    const pageSubtasks = paginatedEntries.flatMap((e) => e.subtasks);

    res.json({
      subtasks: pageSubtasks,
      projects: pageProjects,
      completed: completedCount,   // full date-range total, not just this page
      timeLogged,                   // full date-range total
      pagination: {
        total: totalProjects,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalProjects / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getEmployeeDashboardData error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await Employee.find(
      { is_manager: true },
      "full_name email"
    );
    res.json({ success: true, data: managers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Controller for getting employee completed tasks
export const getEmployeeCompletedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { range = "all", from = "", to = "", page = 1, limit = 100 } = req.query;

    const dateRange = buildDateRange({ range, from, to });
    const empObjId = new mongoose.Types.ObjectId(employeeId);
    const skip = (Number(page) - 1) * Number(limit);

    // Build stage filter for date range
    const stageMatch = {
      completed: true,
      completed_by: empObjId,
      ...(dateRange ? { completed_at: dateRange } : {}),
    };

    // Aggregate: find subtasks where employee completed at least one stage
    // within the date range, and compute time spent per subtask
    const subtasks = await SubTask.aggregate([
      {
        $match: {
          "stages.completed_by": empObjId,
        },
      },
      {
        $lookup: {
          from: "projects",
          let: { pid: "$project_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pid"] } } },
            { $project: { project_name: 1 } },
          ],
          as: "project",
        },
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          // Filter to only stages completed by this employee within date range
          completedStages: {
            $filter: {
              input: "$stages",
              as: "stage",
              cond: {
                $and: [
                  { $eq: ["$$stage.completed", true] },
                  { $eq: ["$$stage.completed_by", empObjId] },
                  ...(dateRange?.$gte ? [{ $gte: ["$$stage.completed_at", dateRange.$gte] }] : []),
                  ...(dateRange?.$lte ? [{ $lte: ["$$stage.completed_at", dateRange.$lte] }] : []),
                ],
              },
            },
          },
          // Time spent by this employee
          timeSpentMs: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$time_logs",
                    as: "log",
                    cond: {
                      $and: [
                        { $eq: ["$$log.user_id", empObjId] },
                        { $ifNull: ["$$log.start_time", false] },
                        { $ifNull: ["$$log.end_time", false] },
                      ],
                    },
                  },
                },
                as: "log",
                in: { $subtract: ["$$log.end_time", "$$log.start_time"] },
              },
            },
          },
        },
      },
      // Drop subtasks with no completed stages after filtering
      { $match: { "completedStages.0": { $exists: true } } },
      // Unwind so each completed stage becomes its own result row
      { $unwind: "$completedStages" },
      {
        $project: {
          task_name: 1,
          project_id: "$project._id",
          project_name: "$project.project_name",
          stage_name: "$completedStages.name",
          completed_at: "$completedStages.completed_at",
          priority: 1,
          status: 1,
          timeSpentMs: 1,
        },
      },
      { $sort: { completed_at: -1 } },
    ]);

    // Attach formatted time and group by project
    const grouped = {};
    let grandTotalMs = 0;

    subtasks.forEach((row) => {
      const ms = row.timeSpentMs ?? 0;
      grandTotalMs += ms;

      const pid = row.project_id?.toString() ?? "unknown";
      if (!grouped[pid]) {
        grouped[pid] = {
          project_id: pid,
          project_name: row.project_name ?? "Unknown",
          tasks: [],
          totalTimeMs: 0,
        };
      }

      grouped[pid].totalTimeMs += ms;
      grouped[pid].tasks.push({
        task_id: row._id,
        task_name: row.task_name,
        stage_name: row.stage_name,
        completed_at: row.completed_at,
        priority: row.priority,
        status: row.status,
        timeSpentMs: ms,
      });
    });

    const projects = Object.values(grouped);
    const totalTasks = subtasks.length;

    // Paginate at the project level
    const paginatedProjects = projects.slice(skip, skip + Number(limit));

    res.json({
      projects: paginatedProjects,
      summary: {
        totalTasks,
        totalProjects: projects.length,
        totalTimeMs: grandTotalMs,
      },
      pagination: {
        total: projects.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(projects.length / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getEmployeeCompletedTasks error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEmployeeActivityHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      range = "week",
      from = "",
      to = "",
      type = "all",
      project: projectFilter = "",
      page = 1,
      limit = 50,
    } = req.query;

    const dateRange = buildDateRange({ range, from, to });
    const empObjId = new mongoose.Types.ObjectId(employeeId);
    const skip = (Number(page) - 1) * Number(limit);

    // ── Fetch relevant subtasks ──────────────────────────────────────────
    const subtaskQuery = {
      $or: [
        { assign_to: empObjId },
        { "stages.completed_by": empObjId },
        { "time_logs.user_id": empObjId },
      ],
    };

    const subtasks = await SubTask.find(subtaskQuery)
      .populate("project_id", "project_name")
      .lean();

    // ── Build activity list from subtask data ───────────────────────────
    const activities = [];

    subtasks.forEach((subtask) => {
      const projectName = subtask.project_id?.project_name ?? "Unknown Project";
      const taskName = subtask.task_name;
      const taskId = subtask._id;

      // Task Assignment
      if (subtask.assign_to?.toString() === employeeId && subtask.assign_date) {
        activities.push({
          type: "task_assigned",
          timestamp: subtask.assign_date,
          task_name: taskName,
          task_id: taskId,
          project_name: projectName,
          details: "Task assigned to you",
        });
      }

      // Time log activities
      (subtask.time_logs ?? []).forEach((log) => {
        if (log.user_id?.toString() !== employeeId) return;

        if (log.start_time) {
          activities.push({
            type: "task_started",
            timestamp: log.start_time,
            task_name: taskName,
            task_id: taskId,
            project_name: projectName,
            details: "Started working on task",
          });
        }

        if (log.end_time) {
          const dur = moment.duration(moment(log.end_time).diff(moment(log.start_time)));
          const h = Math.floor(dur.asHours()), m = dur.minutes(), s = dur.seconds();
          const durationStr = `${h}h ${m}m ${s}s`;
          activities.push({
            type: "task_paused",
            timestamp: log.end_time,
            task_name: taskName,
            task_id: taskId,
            project_name: projectName,
            duration: durationStr,
            duration_seconds: dur.asSeconds(),
            details: `Paused task after ${durationStr}`,
          });
        }
      });

      // Stage completions
      (subtask.stages ?? []).forEach((stage) => {
        if (!stage.completed || stage.completed_by?.toString() !== employeeId || !stage.completed_at) return;

        const stageLogs = (subtask.time_logs ?? []).filter(
          (l) => l.user_id?.toString() === employeeId && l.start_time && l.end_time
        );
        const totalSec = stageLogs.reduce(
          (acc, l) => acc + moment(l.end_time).diff(moment(l.start_time), "seconds"), 0
        );
        const dur = moment.duration(totalSec, "seconds");

        activities.push({
          type: "stage_completed",
          timestamp: stage.completed_at,
          task_name: taskName,
          task_id: taskId,
          project_name: projectName,
          stage_name: stage.name,
          duration: `${Math.floor(dur.asHours())}h ${dur.minutes()}m`,
          duration_seconds: totalSec,
          details: `Completed "${stage.name}" stage`,
        });
      });
    });

    // ── Apply filters ────────────────────────────────────────────────────
    let filtered = activities;

    if (dateRange) {
      filtered = filtered.filter((a) => {
        const ts = new Date(a.timestamp);
        return (!dateRange.$gte || ts >= dateRange.$gte) &&
          (!dateRange.$lte || ts <= dateRange.$lte);
      });
    }

    if (type !== "all") {
      filtered = filtered.filter((a) => a.type === type);
    }

    if (projectFilter) {
      filtered = filtered.filter((a) =>
        a.project_name?.toLowerCase().includes(projectFilter.toLowerCase())
      );
    }

    // ── Sort + paginate ──────────────────────────────────────────────────
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + Number(limit));

    // ── Stats ────────────────────────────────────────────────────────────
    const stats = {
      totalActivities: total,
      tasksStarted: filtered.filter((a) => a.type === "task_started").length,
      tasksPaused: filtered.filter((a) => a.type === "task_paused").length,
      tasksCompleted: filtered.filter((a) => a.type === "stage_completed").length,
      totalTimeSpent: filtered
        .filter((a) => a.duration_seconds)
        .reduce((acc, a) => acc + a.duration_seconds, 0),
    };

    // Extract unique projects for filter dropdown
    const uniqueProjects = [...new Set(activities.map((a) => a.project_name).filter(Boolean))];

    res.json({
      activities: paginated,
      stats,
      uniqueProjects,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getEmployeeActivityHistory error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEmployeeTimeTracking = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { range = "today", from = "", to = "", page = 1, limit = 20 } = req.query;

    const dateRange = buildDateRange({ range, from, to });
    const empObjId = new mongoose.Types.ObjectId(employeeId);
    const skip = (Number(page) - 1) * Number(limit);

    const subtaskPipeline = [
      {
        $match: {
          $or: [{ assign_to: empObjId }, { "time_logs.user_id": empObjId }],
          "time_logs.0": { $exists: true },
        },
      },
      {
        $addFields: {
          // Filter logs: must belong to this employee and have both start+end
          filteredLogs: {
            $filter: {
              input: "$time_logs",
              as: "log",
              cond: {
                $and: [
                  { $eq: ["$$log.user_id", empObjId] },
                  { $ifNull: ["$$log.start_time", false] },
                  { $ifNull: ["$$log.end_time", false] },
                  ...(dateRange?.$gte ? [{ $gte: ["$$log.start_time", dateRange.$gte] }] : []),
                  ...(dateRange?.$lte ? [{ $lte: ["$$log.start_time", dateRange.$lte] }] : []),
                ],
              },
            },
          },
        },
      },
      { $match: { "filteredLogs.0": { $exists: true } } },
      {
        $addFields: {
          timeSpentMs: {
            $sum: {
              $map: {
                input: "$filteredLogs",
                as: "log",
                in: { $subtract: ["$$log.end_time", "$$log.start_time"] },
              },
            },
          },
        },
      },
      {
        $project: {
          task_name: 1,
          stages: 1,
          status: 1,
          due_date: 1,
          project_id: 1,
          timeSpentMs: 1,
          filteredLogs: 1,
        },
      },
    ];

    // Group by project using aggregation
    const [countRes, projects, summaryRes] = await Promise.all([
      // Count distinct projects
      Project.aggregate([
        {
          $lookup: {
            from: "subtasks",
            let: { pid: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$project_id", "$$pid"] },
                  $or: [{ assign_to: empObjId }, { "time_logs.user_id": empObjId }],
                  "time_logs.0": { $exists: true },
                },
              },
              ...subtaskPipeline.slice(1), // re-use filter logic
            ],
            as: "subtasks",
          },
        },
        { $match: { "subtasks.0": { $exists: true } } },
        { $count: "total" },
      ]),

      // Paginated project list with subtasks
      Project.aggregate([
        {
          $lookup: {
            from: "subtasks",
            let: { pid: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$project_id", "$$pid"] },
                  $or: [{ assign_to: empObjId }, { "time_logs.user_id": empObjId }],
                  "time_logs.0": { $exists: true },
                },
              },
              ...subtaskPipeline.slice(1),
            ],
            as: "subtasks",
          },
        },
        { $match: { "subtasks.0": { $exists: true } } },
        {
          $addFields: {
            totalTimeMs: { $sum: "$subtasks.timeSpentMs" },
            subtaskCount: { $size: "$subtasks" },
          },
        },
        { $sort: { totalTimeMs: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $project: {
            project_name: 1,
            status: 1,
            subtasks: 1,
            totalTimeMs: 1,
            subtaskCount: 1,
          },
        },
      ]),

      // Summary totals
      SubTask.aggregate([
        ...subtaskPipeline,
        {
          $group: {
            _id: null,
            totalSubtasks: { $sum: 1 },
            totalTimeMs: { $sum: "$timeSpentMs" },
          },
        },
      ]),
    ]);

    const total = countRes[0]?.total ?? 0;
    const summary = summaryRes[0] ?? { totalSubtasks: 0, totalTimeMs: 0 };

    res.json({
      projects,
      summary: {
        ...summary,
        totalProjects: total,
      },
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getEmployeeTimeTracking error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

