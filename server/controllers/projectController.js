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
    const {
      page = 1,
      limit = 20,
      search = "",
      client = "",
      status = "",
      priority = "",
      stage = "",
      employee = "",
      subtaskStatus = "",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // ── 1. Build project-level match ──────────────────────────────────
    const projectMatch = { isArchived: false };

    if (search) {
      projectMatch.project_name = { $regex: search, $options: "i" };
    }
    if (client) {
      projectMatch.client_id = client;
    }
    if (status) {
      projectMatch.status = status;
    }
    if (priority) {
      projectMatch.priority = priority;
    }

    // ── 2. Build subtask-level match ──────────────────────────────────
    // Used BOTH in the $lookup pipeline and to decide whether a project
    // should be included (when subtask filters are active).
    const subtaskMatch = {};

    if (employee) {
      subtaskMatch.assign_to = new mongoose.Types.ObjectId(employee);
    }
    if (subtaskStatus) {
      subtaskMatch.status = subtaskStatus;
    }
    if (stage) {
      // Match subtasks whose stages array contains a stage with this name
      subtaskMatch["stages.name"] = stage;
    }

    const hasSubtaskFilter = employee || subtaskStatus || stage;

    // ── 3. Aggregation pipeline ───────────────────────────────────────
    const pipeline = [
      { $match: projectMatch },

      // Join subtasks — filter them in the pipeline so we only pull
      // the fields we actually render in the table.
      {
        $lookup: {
          from: "subtasks",
          let: { pid: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project_id", { $toObjectId: "$$pid" }] },
                ...(Object.keys(subtaskMatch).length ? subtaskMatch : {}),
              },
            },
            // Only send the columns the UI needs — keeps the payload small
            {
              $project: {
                task_name: 1,
                status: 1,
                priority: 1,
                stages: 1,
                current_stage_index: 1,
                assign_to: 1,
                assign_date: 1,
                due_date: 1,
                url: 1,
                time_logs: 1,
              },
            },
          ],
          as: "subtasks",
        },
      },

      // If subtask filters are active, drop projects that have no
      // matching subtasks after the filtered $lookup.
      ...(hasSubtaskFilter
        ? [{ $match: { "subtasks.0": { $exists: true } } }]
        : []),
    ];

    // Run count and data queries in parallel
    const [countResult, projects] = await Promise.all([
      Project.aggregate([...pipeline, { $count: "total" }]),
      Project.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        // Only send project fields the table renders
        {
          $project: {
            project_name: 1,
            client_id: 1,
            assign_date: 1,
            due_date: 1,
            priority: 1,
            status: 1,
            subtasks: 1,
          },
        },
      ]),
    ]);

    const total = countResult[0]?.total ?? 0;

    res.status(200).json({
      projects,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllProjectsWithTasks error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProjectsForReportingManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const {
      search = "",
      status = "",
      priority = "",
      stage = "",
      employee = "",
      page = 1,
      limit = 20,
    } = req.query;

    const manager = await Employee.findById(managerId).lean();
    if (!manager) return res.status(404).json({ success: false, message: "Manager not found" });

    const manageStages = manager.manage_stages ?? [];

    // Get employee IDs under this manager
    const teamEmployees = await Employee.find({ reporting_manager: managerId }, "_id").lean();
    const teamIds = teamEmployees.map((e) => e._id);

    const skip = (Number(page) - 1) * Number(limit);

    const projectMatch = { isArchived: false };
    if (search) projectMatch.project_name = { $regex: search, $options: "i" };
    if (status) projectMatch.status = status;
    if (priority) projectMatch.priority = priority;

    const subtaskMatch = {};
    if (employee) subtaskMatch.assign_to = new mongoose.Types.ObjectId(employee);
    if (stage) subtaskMatch["stages.name"] = stage;

    const subtaskPipeline = [
      {
        $match: {
          $expr: { $eq: ["$project_id", "$$pid"] },
          $or: [
            { assign_to: { $in: teamIds } },
            // Stage matches current stage name
            ...(manageStages.length
              ? [{
                $expr: {
                  $in: [
                    { $arrayElemAt: ["$stages.name", "$current_stage_index"] },
                    manageStages,
                  ],
                },
              }]
              : []),
          ],
          ...subtaskMatch,
        },
      },
      {
        $project: {
          task_name: 1, stages: 1, current_stage_index: 1,
          priority: 1, status: 1, url: 1,
          assign_to: 1, assign_date: 1, due_date: 1, time_logs: 1,
        },
      },
    ];

    const pipeline = [
      { $match: projectMatch },
      {
        $lookup: {
          from: "subtasks",
          let: { pid: "$_id" },
          pipeline: subtaskPipeline,
          as: "subtasks",
        },
      },
      { $match: { "subtasks.0": { $exists: true } } },
    ];

    const [countRes, projects] = await Promise.all([
      Project.aggregate([...pipeline, { $count: "total" }]),
      Project.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
        {
          $project: {
            project_name: 1, client_id: 1,
            assign_date: 1, due_date: 1,
            priority: 1, status: 1, subtasks: 1,
          },
        },
      ]),
    ]);

    res.json({
      projects,
      pagination: {
        total: countRes[0]?.total ?? 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countRes[0]?.total ?? 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getProjectsForReportingManager error:", error);
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