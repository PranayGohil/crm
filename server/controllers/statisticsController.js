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

// Get number of days in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const Summary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalEmployees = await Employee.countDocuments();

    const totalTasks = await SubTask.countDocuments();

    // Count subtasks by stage
    const tasksByStage = {};
    for (const stage of stageOptions) {
      tasksByStage[stage] = await SubTask.countDocuments({ stage });
    }

    res.json({
      totalProjects,
      totalClients,
      totalEmployees,
      totalTasks,
      tasksByStage, // { "CAD Design": 3, "SET Design": 7, ... }
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
    const today = now.getDate();

    const daysInMonth = getDaysInMonth(year, month);
    const remainingDays = [];

    // 👉 Build array of remaining dates from tomorrow to end of month
    for (let d = today + 1; d <= daysInMonth; d++) {
      remainingDays.push(new Date(year, month, d));
    }

    const remainingSundays = remainingDays.filter(
      (date) => date.getDay() === 0 // Sunday = 0
    ).length;

    const remainingWorkingDays = remainingDays.length - remainingSundays;

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
        };
      }

      const cap = emp.capacity || 0;

      departmentData[dept].totalDailyCapacity += cap;
      departmentData[dept].totalRemainingMonthlyCapacityWithSundays +=
        cap * remainingDays.length;

      departmentData[dept].totalRemainingMonthlyCapacityWithoutSundays +=
        cap * remainingWorkingDays;
    });

    res.status(200).json({
      month: now.toLocaleString("default", { month: "long" }),
      year,
      daysInMonth,
      today,
      remainingDays: remainingDays.length,
      remainingSundays,
      remainingWorkingDays,
      departmentCapacities: departmentData,
    });
  } catch (error) {
    console.error("Error fetching department capacities:", error);
    res.status(500).json({ message: "Server error" });
  }
};
