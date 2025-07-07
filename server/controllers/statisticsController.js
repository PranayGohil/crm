import Client from "../models/clientModel.js";
import Employee from "../models/employeeModel.js";
import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";

export const Summary = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalEmployees = await Employee.countDocuments();

    // Task summary: completed, in progress, overdue
    const completedTasks = await SubTask.countDocuments({
      status: "Completed",
    });
    const inProgressTasks = await SubTask.countDocuments({
      status: "In Progress",
    });
    const overdueTasks = await SubTask.countDocuments({ status: "Overdue" });

    res.json({
      totalProjects,
      totalClients,
      totalEmployees,
      completedTasks,
      inProgressTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const UpcomingDueDates = async (req, res) => {
  try {
    // Get upcoming 5 tasks sorted by due_date
    const tasks = await SubTask.find().sort({ due_date: 1 }).limit(5).lean();

    res.json(tasks);
  } catch (error) {
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
