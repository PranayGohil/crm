import Client from "../models/clientModel.js";
import Employee from "../models/employeeModel.js";
import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";

const stageOptions = ["CAD Design", "SET Design", "Render", "Delivery"];

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
