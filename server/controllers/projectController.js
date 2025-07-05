import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";

export const addProject = async (req, res) => {
  const {
    project_name,
    tasks,
    asign_to,
    assign_date,
    due_date,
    priority,
    status,
  } = req.body;
  const project = await Project.create({
    project_name,
    tasks,
    asign_to,
    assign_date,
    due_date,
    priority,
    status,
  });
  res.status(200).json(project);
};

export const getProjects = async (req, res) => {
  const projects = await Project.find();
  res.status(200).json(projects);
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findByIdAndUpdate(id, req.body);
  res.status(200).json(project);
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findByIdAndDelete(id);
  res.status(200).json(project);
};

export const getProjectInfo = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  res.status(200).json(project);
};

export const getProjectTasks = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  const tasks = project.tasks;
  const subTasks = await SubTask.find({ _id: { $in: tasks } });
  res.status(200).json(subTasks);
};

export const changeProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const project = await Project.findByIdAndUpdate(id, { status });
  res.status(200).json(project);
};
