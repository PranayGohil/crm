import Employee from "../models/employeeModel.js";
import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import Designation from "../models/designationModel.js";
import jwt from "jsonwebtoken";
import moment from "moment";

import mongoose from "mongoose";

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
  const { id } = req.params;
  const employee = await Employee.findById(req.params.id).populate(
    "reporting_manager",
    "full_name"
  );
  res.status(200).json(employee);
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
    employee.emergency_contact =
      emergency_contact || employee.emergency_contact;
    employee.capacity = capacity || employee.capacity;
    employee.department = department || employee.department;
    employee.date_of_joining = date_of_joining
      ? new Date(date_of_joining)
      : employee.date_of_joining;
    employee.monthly_salary = monthly_salary || employee.monthly_salary;
    employee.employment_type = employment_type || employee.employment_type;

    // Reporting manager (expects ObjectId)
    if (reporting_manager) {
      employee.reporting_manager = reporting_manager;
    }

    // is_manager conversion
    if (typeof is_manager !== "undefined") {
      employee.is_manager =
        typeof is_manager === "string" ? is_manager === "true" : !!is_manager;
    }
    employee.manage_stages = is_manager ? manage_stages || [] : [];

    // Profile pic
    if (req.file) {
      employee.profile_pic = req.file.path;
    }

    await employee.save();

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
  const { id } = req.params;
  const employee = await Employee.findByIdAndDelete(id);
  res.status(200).json(employee);
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
    const employeeId = req.params.employeeId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const assignedSubtasks = await SubTask.find({
      assign_to: employeeId,
    }).populate("project_id");

    const stageSubtasks = await SubTask.find({
      "stages.completed_by": employeeId,
    }).populate("project_id");

    let allSubtasks = [
      ...assignedSubtasks,
      ...stageSubtasks.filter(
        (s) => !assignedSubtasks.some((a) => a._id.equals(s._id))
      ),
    ];

    const uniqueProjectIds = [
      ...new Set(
        allSubtasks.map((s) => s.project_id?._id?.toString()).filter(Boolean)
      ),
    ];
    const projects = await Project.find({ _id: { $in: uniqueProjectIds } });

    let totalMs = 0;
    let completedCount = 0; // This will now count completed STAGES

    allSubtasks.forEach((task) => {
      // Count completed stages by this employee
      const employeeCompletedStages = task.stages.filter((stage) => {
        if (!stage.completed || stage.completed_by?.toString() !== employeeId) {
          return false;
        }

        // Apply date filter if provided
        if (!start) return true;

        const completedAt = new Date(stage.completed_at);
        return completedAt >= start && completedAt <= end;
      });

      completedCount += employeeCompletedStages.length;

      // Time logs calculation (unchanged)
      (task.time_logs || []).forEach((log) => {
        if (log.user_id?.toString() === employeeId) {
          const logStart = new Date(log.start_time);
          const logEnd = log.end_time ? new Date(log.end_time) : new Date();

          if (!start || logEnd >= start) {
            const effectiveStart = start && logStart < start ? start : logStart;
            const effectiveEnd = end && logEnd > end ? end : logEnd;
            if (!end || logStart <= end) {
              totalMs += effectiveEnd - effectiveStart;
            }
          }
        }
      });
    });

    allSubtasks = allSubtasks.map((task) => {
      const employeeStages = task.stages
        .filter((st) => st.completed_by?.toString() === employeeId)
        .map((st) => st.name);

      const currentStage =
        task.current_stage_index !== undefined
          ? task.stages[task.current_stage_index]
          : null;

      const isCurrentStageAssignedToEmployee =
        task.assign_to?.toString?.() === employeeId;

      return {
        ...task.toObject(),
        employeeCompletedStages: employeeStages,
        completedByEmployee: employeeStages.length > 0,
        currentStageAssignedToEmployee: isCurrentStageAssignedToEmployee,
      };
    });

    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const timeLogged = `${hours}h ${minutes}m ${seconds}s`;

    res.json({
      subtasks: allSubtasks,
      projects,
      completed: completedCount, // Now counts completed STAGES, matching the other page
      timeLogged,
    });
  } catch (error) {
    console.error("Error fetching employee dashboard data:", error);
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

    // Find all subtasks where this employee completed at least one stage
    const subtasks = await SubTask.find({
      "stages.completed_by": employeeId,
    }).populate("project_id", "project_name");

    // Transform the data to show each completed stage as a separate entry
    const completedTasks = [];

    subtasks.forEach((subtask) => {
      // Filter stages completed by this employee
      const completedStages = subtask.stages.filter(
        (stage) =>
          stage.completed &&
          stage.completed_by &&
          stage.completed_by.toString() === employeeId
      );

      // For each completed stage, create an entry
      completedStages.forEach((stage) => {
        // Calculate time spent by this employee on this subtask
        let totalTimeInSeconds = 0;
        subtask.time_logs?.forEach((log) => {
          if (
            log.start_time &&
            log.end_time &&
            log.user_id &&
            log.user_id.toString() === employeeId
          ) {
            const diff = moment(log.end_time).diff(
              moment(log.start_time),
              "seconds"
            );
            totalTimeInSeconds += diff;
          }
        });

        // Format time spent
        const duration = moment.duration(totalTimeInSeconds, "seconds");
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        const timeSpent = `${hours}h ${minutes}m ${seconds}s`;

        completedTasks.push({
          task_id: subtask._id,
          task_name: subtask.task_name,
          project_id: subtask.project_id._id,
          project_name: subtask.project_id.project_name,
          stage_name: stage.name,
          completed_at: stage.completed_at,
          timeSpent: timeSpent,
          timeSpentSeconds: totalTimeInSeconds,
          priority: subtask.priority,
          status: subtask.status,
        });
      });
    });

    // Sort by completion date (most recent first)
    completedTasks.sort(
      (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
    );

    res.json(completedTasks);
  } catch (error) {
    console.error("Error fetching employee completed tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEmployeeActivityHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all subtasks where this employee is involved
    const subtasks = await SubTask.find({
      $or: [
        { assign_to: employeeId },
        { "stages.completed_by": employeeId },
        { "time_logs.user_id": employeeId },
      ],
    }).populate("project_id", "project_name");

    const activities = [];

    subtasks.forEach((subtask) => {
      const projectName = subtask.project_id?.project_name || "Unknown Project";
      const taskName = subtask.task_name;
      const taskId = subtask._id;

      // 1. Task Assignment Activity
      if (
        subtask.assign_to &&
        subtask.assign_to.toString() === employeeId &&
        subtask.assign_date
      ) {
        activities.push({
          type: "task_assigned",
          timestamp: subtask.assign_date,
          task_name: taskName,
          task_id: taskId,
          project_name: projectName,
          details: `Task assigned to you`,
        });
      }

      // 2. Time Log Activities (Started/Paused)
      subtask.time_logs?.forEach((log) => {
        if (log.user_id && log.user_id.toString() === employeeId) {
          // Task Started
          if (log.start_time) {
            activities.push({
              type: "task_started",
              timestamp: log.start_time,
              task_name: taskName,
              task_id: taskId,
              project_name: projectName,
              details: `Started working on task`,
            });
          }

          // Task Paused
          if (log.end_time) {
            const duration = moment.duration(
              moment(log.end_time).diff(moment(log.start_time))
            );
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            const seconds = duration.seconds();
            const durationFormatted = `${hours}h ${minutes}m ${seconds}s`;
            const durationSeconds = duration.asSeconds();

            activities.push({
              type: "task_paused",
              timestamp: log.end_time,
              task_name: taskName,
              task_id: taskId,
              project_name: projectName,
              duration: durationFormatted,
              duration_seconds: durationSeconds,
              details: `Paused task after working for ${durationFormatted}`,
            });
          }
        }
      });

      // 3. Stage Completion Activities
      subtask.stages?.forEach((stage) => {
        if (
          stage.completed &&
          stage.completed_by &&
          stage.completed_by.toString() === employeeId &&
          stage.completed_at
        ) {
          // Calculate time spent on this stage
          const stageLogs = subtask.time_logs?.filter(
            (log) =>
              log.user_id &&
              log.user_id.toString() === employeeId &&
              log.start_time &&
              log.end_time
          );

          let totalSeconds = 0;
          stageLogs?.forEach((log) => {
            totalSeconds += moment(log.end_time).diff(
              moment(log.start_time),
              "seconds"
            );
          });

          const duration = moment.duration(totalSeconds, "seconds");
          const hours = Math.floor(duration.asHours());
          const minutes = duration.minutes();
          const durationFormatted = `${hours}h ${minutes}m`;

          activities.push({
            type: "stage_completed",
            timestamp: stage.completed_at,
            task_name: taskName,
            task_id: taskId,
            project_name: projectName,
            stage_name: stage.name,
            duration: durationFormatted,
            duration_seconds: totalSeconds,
            details: `Completed "${stage.name}" stage`,
          });
        }
      });

      // 4. Status Changes (can be inferred from time logs pattern)
      // We can add status change tracking if you have a status_history field
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => moment(b.timestamp).diff(moment(a.timestamp)));

    res.json({
      activities,
      employee_id: employeeId,
    });
  } catch (error) {
    console.error("Error fetching employee activity history:", error);
    res.status(500).json({ error: "Server error" });
  }
};
