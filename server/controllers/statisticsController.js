import {
  getDaysInMonth,
  startOfTomorrow,
  eachDayOfInterval,
  isSunday,
  addDays,
  isSameDay,
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

    // Only focus on the 3 main stages
    const stages = ["CAD Design", "SET Design", "Render"];

    // Count tasks by each stage
    const stageCounts = {};
    for (const stage of stages) {
      stageCounts[stage] = await SubTask.countDocuments({ stage });
    }

    // Cumulative logic for remaining tasks
    const tasksByStage = {
      "CAD Design": stageCounts["CAD Design"],

      "SET Design": stageCounts["CAD Design"] + stageCounts["SET Design"],

      Render:
        stageCounts["CAD Design"] +
        stageCounts["SET Design"] +
        stageCounts["Render"],
    };

    console.log("Tasks by stage:", tasksByStage);

    res.json({
      totalProjects,
      totalClients,
      totalEmployees,
      totalTasks,
      tasksByStage, // cumulative remaining tasks by stage
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
      .limit(5)
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

    const customHolidays = [
      new Date(2025, 6, 29), // July 29
      new Date(2025, 7, 15), // August 15
    ];

    const isHoliday = (date) =>
      isSunday(date) ||
      customHolidays.some((holiday) => isSameDay(date, holiday));

    const workingDays = allDaysInMonth.filter((date) => !isHoliday(date));

    const employees = await Employee.find();
    const allowedDepartments = ["SET Design", "CAD Design", "Render"];

    const departmentData = {};

    employees.forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!allowedDepartments.includes(dept)) return;

      if (!departmentData[dept]) {
        departmentData[dept] = {
          totalDailyCapacity: 0,
          totalRemainingMonthlyCapacityWithSundays: 0,
          totalRemainingMonthlyCapacityWithoutSundays: 0,
          estimatedDaysToComplete: 0,
          estimatedDaysToCompleteWithoutSundays: 0,
          estimatedCompletionDate: null,
        };
      }

      const cap = emp.capacity || 0;
      departmentData[dept].totalDailyCapacity += cap;
      departmentData[dept].totalRemainingMonthlyCapacityWithSundays +=
        cap * allDaysInMonth.length;
      departmentData[dept].totalRemainingMonthlyCapacityWithoutSundays +=
        cap * workingDays.length;
    });

    // Task stage logic
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

    // Loop over departments and simulate task completion
    for (const [stage, totalTasks] of Object.entries(stageCounts)) {
      const dept = departmentData[stage];
      if (!dept) continue;

      const dailyCap = dept.totalDailyCapacity;
      if (!dailyCap || totalTasks === 0) continue;

      // === Estimated Calendar Days ===
      let calendarRemainingTasks = totalTasks;
      let calendarDaysNeeded = 0;
      let calendarDate = startDate;

      while (calendarRemainingTasks > 0) {
        calendarRemainingTasks -= dailyCap;
        calendarDaysNeeded++;
        calendarDate = addDays(calendarDate, 1);
      }

      dept.estimatedDaysToComplete = calendarDaysNeeded;

      // === Simulate Working Day-Based Completion ===
      let remainingTasks = totalTasks;
      let workingDaysNeeded = 0;
      let currentDate = startDate;

      while (remainingTasks > 0) {
        if (!isHoliday(currentDate)) {
          remainingTasks -= dailyCap;
          workingDaysNeeded++;
        }
        currentDate = addDays(currentDate, 1);
      }

      dept.estimatedDaysToCompleteWithoutSundays = workingDaysNeeded;
      // Function to add working days to a date
      const addWorkingDays = (date, numberOfDays) => {
        let result = new Date(date);
        let addedDays = 0;

        while (addedDays < numberOfDays) {
          result = addDays(result, 1);
          if (!isHoliday(result)) {
            addedDays++;
          }
        }

        return result;
      };

      // Replace the wrong line with correct working-day based date
      dept.estimatedCompletionDate = addWorkingDays(
        startDate,
        workingDaysNeeded
      );
    }

    console.log("Department Data:", departmentData);

    res.status(200).json({
      month: now.toLocaleString("default", { month: "long" }),
      year,
      today: now.getDate(),
      daysInMonth: totalDaysInMonth,
      remainingDays: allDaysInMonth.length,
      totalHolidays: allDaysInMonth.filter(isHoliday).length,
      remainingWorkingDays: workingDays.length,
      departmentCapacities: departmentData,
    });
  } catch (error) {
    console.error("Error fetching department capacities:", error);
    res.status(500).json({ message: "Server error" });
  }
};
