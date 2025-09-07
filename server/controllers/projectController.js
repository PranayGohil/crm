import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";
import Employee from "../models/employeeModel.js";

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
      description,
      status,
      content,
    } = JSON.parse(req.body.data);

    let newUploadedFiles = [];
    if (req.files && req.files.length > 0) {
      newUploadedFiles = req.files.map((file) => file.path); // Cloudinary URL
    }

    const project = await Project.create({
      project_name,
      client_id,
      assign_to,
      assign_date,
      due_date,
      priority,
      description,
      status,
      tasks,
      content: [
        {
          ...content,
          uploaded_files: newUploadedFiles,
        },
      ],
    });

    return res
      .status(200)
      .json({ success: true, message: "Project created", project });
  } catch (error) {
    console.error("addProjectWithContent error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({ isArchived: false });
  res.status(200).json(projects);
};

export const getProjectWithArchived = async (req, res) => {
  const projects = await Project.find({});
  res.status(200).json(projects);
};

export const updateProject = async (req, res) => {
  try {
    const { data } = req.body;
    const parsedData = JSON.parse(data);

    const uploadedFiles = req.files?.map((file) => file.path) || []; // Cloudinary URL
    const retainedFiles = parsedData.content.existing_files || [];

    const updatedFields = {
      ...parsedData,
      content: [
        {
          ...parsedData.content,
          uploaded_files: [...retainedFiles, ...uploadedFiles],
        },
      ],
    };

    await Project.findByIdAndUpdate(req.params.id, updatedFields);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Update failed" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Find subtasks related to this project
    const subtasks = await SubTask.find({ project_id: id });

    if (subtasks.length > 0) {
      // Check if any subtask is in progress
      const inProgressTask = subtasks.find(
        (task) => task.status === "In Progress"
      );
      if (inProgressTask) {
        return res.status(400).json({
          message:
            "Cannot delete project. One or more subtasks are In Progress.",
        });
      }

      // If no subtasks are in progress → delete them
      await SubTask.deleteMany({ project_id: id });
    }

    // Now delete the project
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project and related subtasks deleted successfully",
      project,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
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
    const projects = await Project.find({ isArchived: false });
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
            stages: s.stages,
            current_stage_index: s.current_stage_index,
            priority: s.priority,
            status: s.status,
            url: s.url,
            assign_to: s.assign_to || null,
            assign_date: s.assign_date,
            due_date: s.due_date,
            time_logs: s.time_logs,
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

export const getProjectsForReportingManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    // 1. Find the manager (to access manage_stages)
    const manager = await Employee.findById(managerId);
    if (!manager) {
      return res
        .status(404)
        .json({ success: false, message: "Manager not found" });
    }

    const manageStages = manager.manage_stages || [];

    // 2. Find employees under this reporting manager
    const employees = await Employee.find({ reporting_manager: managerId });
    const employeeIds = employees.map((emp) => emp._id.toString());

    // 3. Get all projects
    const projects = await Project.find({ isArchived: false });

    // 4. Filter projects by subtasks
    const projectsWithSubtasks = await Promise.all(
      projects.map(async (proj) => {
        // Subtasks of manager’s employees
        const employeeSubtasks = await SubTask.find({
          project_id: proj._id.toString(),
          assign_to: { $in: employeeIds },
        });

        // Subtasks matching manager’s manage_stages
        const stageSubtasks = await SubTask.find({
          project_id: proj._id.toString(),
          $expr: {
            $in: [
              { $arrayElemAt: ["$stages.name", "$current_stage_index"] },
              manageStages,
            ],
          },
        });

        // Merge & remove duplicates
        const allSubtasks = [...employeeSubtasks, ...stageSubtasks].filter(
          (s, idx, arr) =>
            idx ===
            arr.findIndex((ss) => ss._id.toString() === s._id.toString())
        );

        if (allSubtasks.length === 0) return null;

        return {
          id: proj._id,
          project_name: proj.project_name,
          client_id: proj.client_id,
          assign_date: proj.assign_date,
          due_date: proj.due_date,
          priority: proj.priority,
          status: proj.status,
          subtasks: allSubtasks.map((s) => ({
            id: s._id,
            task_name: s.task_name,
            stages: s.stages,
            current_stage_index: s.current_stage_index,
            priority: s.priority,
            status: s.status,
            url: s.url,
            assign_to: s.assign_to || null,
            assign_date: s.assign_date,
            due_date: s.due_date,
            time_logs: s.time_logs,
          })),
        };
      })
    );

    const filteredProjects = projectsWithSubtasks.filter(Boolean);
    res.status(200).json(filteredProjects);
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
    await SubTask.deleteMany({ project_id: { $in: ids } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete projects" });
  }
};

// Archive Project
export const archiveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project archived successfully", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unarchiveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { isArchived: false, archivedAt: null },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project unarchived successfully", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getArchivedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: true });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
