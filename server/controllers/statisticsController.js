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
    const tasks = await SubTask.find()
      .sort({ due_date: 1 })  // you might sort by project due_date if you want
      .limit(5)
      .populate({
        path: "project_id",
        select: "project_name due_date"
      })
      .populate({
        path: "asign_to.id",
        select: "full_name profile_pic"
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
