import {
  addDays,
  eachDayOfInterval,
  getDaysInMonth,
  isSunday,
  startOfTomorrow,
} from "date-fns";

import Client from "../models/clientModel.js";
import Employee from "../models/employeeModel.js";
import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";
import {
  getProjectPermissionQuery,
  getClientStageQuery,
  getEmployeeStageQuery,
} from "../utils/projectPermissions.js";

// Stage scopes applied only when an admin token is present (optionalAuth);
// otherwise empty (unscoped) to preserve existing dashboard behavior.
const projScope = (req) => (req.admin ? getProjectPermissionQuery(req.admin) : {});
const clientScope = (req) => (req.admin ? getClientStageQuery(req.admin) : {});
// Employees are owned per child admin (tenant isolation), not stage-scoped.
const employeeScope = (req) => {
  if (!req.admin || req.admin.role === "super-admin") return {};
  return { owner: req.admin._id };
};
// Stage names this admin manages ([] = all) for filtering subtask aggregates.
const myStageMatch = (req) => {
  if (req.admin && req.admin.role === "admin" && (req.admin.manage_stages || []).length > 0) {
    return req.admin.manage_stages;
  }
  return null; // null = no stage restriction
};

export const Summary = async (req, res) => {
  try {
    const stageNames = myStageMatch(req);
    const projectStageMatch = stageNames ? { "project.stages": { $in: stageNames } } : {};

    // Count projects, clients, employees (stage-scoped for admins)
    const totalProjects = await Project.countDocuments({ isArchived: false, ...projScope(req) });
    const totalClients = await Client.countDocuments(clientScope(req));
    const totalEmployees = await Employee.countDocuments(employeeScope(req));

    // ✅ Get only subtasks that belong to non-archived projects
    const subtasks = await SubTask.aggregate([
      {
        $lookup: {
          from: "projects", // collection name (lowercase + plural of model name)
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.isArchived": false, ...projectStageMatch } }, // filter archived + stage scope
      {
        $project: {
          stages: 1,
          current_stage_index: 1,
        },
      },
    ]);

    // totalTasks = subtasks of active projects only
    const totalTasks = subtasks.length;

    // Stage counts — limited to the stages this admin manages (all for
    // super-admin / unrestricted admin).
    const relevantStages = stageNames || ["CAD Design", "SET Design", "Render", "QC"];
    const stageCounts = {};
    relevantStages.forEach((s) => { stageCounts[s] = 0; });

    subtasks.forEach((task) => {
      if (
        Array.isArray(task.stages) &&
        typeof task.current_stage_index === "number"
      ) {
        relevantStages.forEach((stageName) => {
          const stageIndex = task.stages.findIndex((s) => s.name === stageName);
          if (stageIndex !== -1 && task.current_stage_index <= stageIndex) {
            stageCounts[stageName]++;
          }
        });
      }
    });

    res.json({
      totalProjects,
      totalClients,
      totalEmployees,
      totalTasks,
      tasksByStage: stageCounts,
    });
  } catch (error) {
    console.error("Summary fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const UpcomingDueDates = async (req, res) => {
  try {
    const stageNames = myStageMatch(req);
    const dueStageMatch = stageNames ? [{ $match: { "project_id.stages": { $in: stageNames } } }] : [];

    const tasks = await SubTask.aggregate([
      { $match: { status: { $ne: "Completed" } } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project_id",
        },
      },
      { $unwind: { path: "$project_id", preserveNullAndEmptyArrays: true } },
      ...dueStageMatch,
      {
        $lookup: {
          from: "clients",
          let: { cid: "$project_id.client_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toString: "$_id" }, "$$cid"] },
              },
            },
            { $project: { status: 1 } },
          ],
          as: "client_info",
        },
      },
      {
        $addFields: {
          client_status: { $ifNull: [{ $arrayElemAt: ["$client_info.status", 0] }, "active"] },
        },
      },
      {
        $addFields: {
          status_weight: {
            $cond: { if: { $eq: ["$client_status", "inactive"] }, then: 1, else: 0 },
          },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "assign_to",
          foreignField: "_id",
          as: "assign_to",
        },
      },
      { $unwind: { path: "$assign_to", preserveNullAndEmptyArrays: true } },
      { $sort: { status_weight: 1, due_date: 1 } },
      {
        $project: {
          task_name: 1,
          due_date: 1,
          status: 1,
          priority: 1,
          "project_id.project_name": 1,
          "project_id.due_date": 1,
          "assign_to.full_name": 1,
          "assign_to.profile_pic": 1,
        },
      },
    ]);

    res.json(tasks);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const RecentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: false, ...projScope(req) })
      .sort({ assign_date: -1 })
      .limit(4)
      .lean();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartmentCapacities = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const totalDaysInMonth = getDaysInMonth(new Date(year, month));
    const startDate = startOfTomorrow();
    const endDate = new Date(year, month, totalDaysInMonth);

    const allDaysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const isHoliday = (date) => isSunday(date);

    const workingDaysInMonth = allDaysInMonth.filter((d) => !isHoliday(d));

    const employees = await Employee.find(employeeScope(req));
    const allowedDepartments = ["SET Design", "CAD Design", "Render", "QC"];
    const departmentData = {};

    // STEP 1: Aggregate department capacities
    employees.forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!allowedDepartments.includes(dept)) return;

      if (!departmentData[dept]) {
        departmentData[dept] = {
          totalDailyCapacity: 0,
          totalRemainingMonthlyCapacityWithSundays: 0,
          totalRemainingMonthlyCapacityWithoutSundays: 0,
          estimatedCompletionDateWithSundays: "No Employees",
          estimatedCompletionDateWithoutSundays: "No Employees",
        };
      }

      const cap = emp.capacity || 0;
      departmentData[dept].totalDailyCapacity += cap;
      departmentData[dept].totalRemainingMonthlyCapacityWithSundays +=
        cap * allDaysInMonth.length;
      departmentData[dept].totalRemainingMonthlyCapacityWithoutSundays +=
        cap * workingDaysInMonth.length;
    });

    // STEP 2: Count SubTasks by stages (only active projects)
    const subtaskStageCounts = await SubTask.aggregate([
      {
        $lookup: {
          from: "projects", // collection name in Mongo
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      { $match: { "project.isArchived": false } }, // only active projects
      { $unwind: "$stages" }, // expand each stage
      {
        $group: {
          _id: "$stages.name",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize counts
    const stageCounts = {
      "CAD Design": 0,
      "SET Design": 0,
      "Render": 0,
      "QC": 0,
    };

    subtaskStageCounts.forEach((s) => {
      if (stageCounts[s._id] !== undefined) {
        stageCounts[s._id] = s.count;
      }
    });

    // STEP 3: Estimate completion dates
    for (const [stageName, totalTasks] of Object.entries(stageCounts)) {
      const dept = departmentData[stageName];
      if (!dept || totalTasks === 0 || dept.totalDailyCapacity === 0) continue;

      const dailyCap = dept.totalDailyCapacity;

      // === With Sundays (Calendar Days) ===
      let remainingCalendarTasks = totalTasks;
      let calendarDate = new Date(startDate);

      while (remainingCalendarTasks > 0) {
        remainingCalendarTasks -= dailyCap;
        calendarDate = addDays(calendarDate, 1);
      }

      dept.estimatedCompletionDateWithSundays = calendarDate;
      dept.estimatedDaysToComplete =
        eachDayOfInterval({
          start: startDate,
          end: calendarDate,
        }).length - 1;

      // === Without Sundays (Working Days Only) ===
      let remainingWorkingTasks = totalTasks;
      let workingDate = new Date(startDate);

      while (remainingWorkingTasks > 0) {
        if (!isHoliday(workingDate)) {
          remainingWorkingTasks -= dailyCap;
        }
        workingDate = addDays(workingDate, 1);
      }

      dept.estimatedCompletionDateWithoutSundays = workingDate;
      dept.estimatedDaysToCompleteWithoutSundays =
        eachDayOfInterval({
          start: startDate,
          end: workingDate,
        }).length - 1;
    }

    res.status(200).json({
      month: now.toLocaleString("default", { month: "long" }),
      year,
      today: now.getDate(),
      daysInMonth: totalDaysInMonth,
      remainingDays: allDaysInMonth.length,
      totalHolidays: allDaysInMonth.filter(isHoliday).length,
      remainingWorkingDays: workingDaysInMonth.length,
      departmentCapacities: departmentData,
    });
  } catch (error) {
    console.error("Error fetching department capacities:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const countWorkingDaysBetween = (start, end) => {
  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => !isSunday(d)).length;
};

