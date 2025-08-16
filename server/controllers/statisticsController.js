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

const stageOptions = ["CAD Design", "SET Design", "Render", "Delivery"];

// Count number of Sundays in a month
const countSundays = (year, month) => {
  let sundays = 0;
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 0) sundays++; // 0 = Sunday
    date.setDate(date.getDate() + 1);
  }
  return sundays;
};

export const Summary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const totalTasks = await SubTask.countDocuments();

    const stageCounts = {
      "CAD Design": 0,
      "SET Design": 0,
      Render: 0,
    };

    const subtasks = await SubTask.find(
      {},
      { stage: 1, current_stage_index: 1 }
    );

    subtasks.forEach((task) => {
      if (
        Array.isArray(task.stage) &&
        typeof task.current_stage_index === "number"
      ) {
        ["CAD Design", "SET Design", "Render"].forEach((stageName) => {
          const stageIndex = task.stage.indexOf(stageName);
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
    const tasks = await SubTask.find({ status: { $ne: "Completed" } }) // filter out Completed
      .sort({ due_date: 1 })
      .populate({
        path: "project_id",
        select: "project_name due_date",
      })
      .populate({
        path: "assign_to",
        select: "full_name profile_pic",
      })
      .lean();

    res.json(tasks);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const RecentProjects = async (req, res) => {
  try {
    const projects = await Project.find()
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

    const employees = await Employee.find();
    const allowedDepartments = ["SET Design", "CAD Design", "Render"];
    const departmentData = {};

    // STEP 1: Aggregate department capacities
    employees.forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!allowedDepartments.includes(dept)) return;
      console.log("Processing employee:", emp.department);
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

    // STEP 2: Count SubTasks by stage
    const stageCounts = {
      "CAD Design": await SubTask.countDocuments({ stage: "CAD Design" }),
      "SET Design":
        (await SubTask.countDocuments({ stage: "CAD Design" })) +
        (await SubTask.countDocuments({ stage: "SET Design" })),
      Render:
        (await SubTask.countDocuments({ stage: "CAD Design" })) +
        (await SubTask.countDocuments({ stage: "SET Design" })) +
        (await SubTask.countDocuments({ stage: "Render" })),
    };

    // STEP 3: Estimate only completion dates (not days count)
    for (const [stage, totalTasks] of Object.entries(stageCounts)) {
      const dept = departmentData[stage];
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
      dept.estimatedDaysToComplete = eachDayOfInterval({
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
      dept.estimatedDaysToCompleteWithoutSundays = eachDayOfInterval({
        start: startDate,
        end: workingDate,
      }).length - 1;
    }

    console.log("Department Data:", departmentData);

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
