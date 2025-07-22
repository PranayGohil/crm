import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";

export const addProject = async (req, res) => {
  try {
    const {
      project_name,
      client_id,
      tasks,
      assign_to,
      assign_date,
      due_date,
      priority,
      status,
    } = req.body;
    const project = await Project.create({
      project_name,
      client_id,
      tasks,
      assign_to,
      assign_date,
      due_date,
      priority,
      status,
    });
    res
      .status(200)
      .json({ success: true, message: "Project added successfully", project });
  } catch (error) {
    console.error("Error adding project:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
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
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error fetching project info:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Change status of a project
export const changeProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({
      message: "Project status updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Change priority of a project
export const changeProjectPriority = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required." });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { priority },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({
      message: "Project priority updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project priority:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const addProjectContent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { items, total_price, description, currency } = JSON.parse(
      req.body.data
    );

    let newUploadedFiles = [];
    if (req.files && req.files.length > 0) {
      newUploadedFiles = req.files.map((file) => file.path);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    console.log("Project found:", project);
    let existingFiles = project.content[0]?.uploaded_files || [];
    console.log("Existing files:", existingFiles);
    let finalUploadedFiles;
    if (newUploadedFiles.length > 0) {
      finalUploadedFiles = [...existingFiles, ...newUploadedFiles];
    } else {
      finalUploadedFiles = existingFiles;
    }

    project.content = {
      items,
      total_price,
      uploaded_files: finalUploadedFiles,
      description,
      currency,
    };

    await project.save();

    return res
      .status(200)
      .json({ success: true, message: "Content updated", project });
  } catch (error) {
    console.error("addProjectContent error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjectsWithTasks = async (req, res) => {
  try {
    const projects = await Project.find({});
    const projectsWithSubtasks = await Promise.all(
      projects.map(async (proj) => {
        const subtasks = await SubTask.find({
          project_id: proj._id.toString(),
        });
        return {
          id: proj._id,
          project_name: proj.project_name,
          client_id: proj.client_id,
          assign_date: proj.assign_date,
          due_date: proj.due_date,
          priority: proj.priority,
          status: proj.status,
          subtasks: subtasks.map((s) => ({
            id: s._id,
            task_name: s.task_name,
            stage: s.stage,
            priority: s.priority,
            status: s.status,
            assign_to: s.assign_to || null,
            assign_date: s.assign_date,
            due_date: s.due_date,
            timeTracked: "-", // add logic if you track time
          })),
        };
      })
    );
    res.status(200).json(projectsWithSubtasks);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const bulkUpdate = async (req, res) => {
  const { ids, field, value } = req.body;
  try {
    await Project.updateMany({ _id: { $in: ids } }, { [field]: value });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update projects" });
  }
};

export const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  try {
    await Project.deleteMany({ _id: { $in: ids } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete projects" });
  }
};
