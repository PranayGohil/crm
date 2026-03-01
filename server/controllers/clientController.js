import Client from "../models/clientModel.js";
import SubTask from "../models/subTaskModel.js";
import Project from "../models/projectModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// clientController.js - update addClient to accept stage_pricing
export const addClient = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      joining_date,
      address,
      username,
      client_type,
      password,
      company_name,
      gst_number,
      business_phone,
      website,
      linkedin,
      business_address,
      additional_notes,
      stage_pricing,
    } = req.body;

    const existingUsername = await Client.findOne({ username });
    if (existingUsername) {
      return res.json({
        success: false,
        message: "Username already exists. Please choose another.",
      });
    }

    const existingEmail = await Client.findOne({ email });
    if (existingEmail) {
      return res.json({
        success: false,
        message: "Email already exists. Please use another email.",
      });
    }

    const client = await Client.create({
      full_name,
      email,
      phone,
      joining_date,
      address,
      username,
      client_type,
      password,
      company_name,
      gst_number,
      business_phone,
      website,
      linkedin,
      business_address,
      additional_notes,
      stage_pricing: stage_pricing || [],
    });

    res.status(200).json({
      success: true,
      message: "Client added successfully",
      client,
    });
  } catch (error) {
    console.error("Error in addClient:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Find client by username
    const client = await Client.findOne({ username });
    if (!client) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // ✅ Compare password
    let isMatch = false;
    if (password === client.password) {
      isMatch = true;
    } else {
      isMatch = false;
    }
    if (isMatch === false) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // ✅ Create token (set role as 'client')
    const token = jwt.sign(
      { id: client._id, role: "client" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Return success response
    res.json({
      _id: client._id,
      username: client.username,
      full_name: client.full_name,
      token,
      role: "client",
    });
  } catch (error) {
    console.error("Client login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error in getClients:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getClientInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    res.status(200).json(client);
  } catch (error) {
    console.error("Error in getClientInfo:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getClientByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const client = await Client.findOne({ username });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error in getClientByUsername:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error in updateClient:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateClientByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    console.log("username", req.body);
    const client = await Client.findOneAndUpdate({ username }, req.body, {
      new: true,
    });
    console.log("client", client);
    res.status(200).json(client);
  } catch (error) {
    console.error("Error in updateClientByUsername:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    console.log("deleteClient called");
    const { id } = req.params;

    // 1. Delete the client
    const client = await Client.findByIdAndDelete(id);

    // 2. Find all projects of that client
    const projects = await Project.find({ client_id: id });

    // 3. Get project ObjectIds properly
    const projectIds = projects.map((p) => new mongoose.Types.ObjectId(p._id));

    // 4. Delete the projects
    await Project.deleteMany({ client_id: id });

    // 5. Delete subtasks linked to those projects
    await SubTask.deleteMany({ project_id: { $in: projectIds } });

    res.status(200).json(client);
  } catch (error) {
    console.error("Error in deleteClient:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getClientTasks = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find all projects for this client
    const projects = await Project.find({ client_id: id }).select("_id");
    const projectIds = projects.map((p) => p._id);

    // Step 2: Find all subtasks where project_id in those projects
    const tasks = await SubTask.find({ project_id: { $in: projectIds } });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error in getClientTasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getClientProjectsWithUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Find client by username
    const client = await Client.findOne({ username });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    console.log("client", client);
    // Find all projects for this client
    const projects = await Project.find({ client_id: client._id });
    console.log("projects", projects);
    res.json({
      client,
      projects,
    });
  } catch (error) {
    console.error("getClientProjectsWithUsername error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClientsWithSubtasks = async (req, res) => {
  try {
    console.log("getClientsWithSubtasks called");
    const clients = await Client.find().lean();

    const clientData = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({ client_id: client._id })
          .select("_id")
          .lean();

        const projectIds = projects.map((p) => p._id);

        const subtasks = await SubTask.find({
          project_id: { $in: projectIds },
        }).lean();

        return {
          ...client,
          projectsCount: projectIds.length,
          subtasks,
        };
      })
    );

    res.json(clientData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get clients with subtasks" });
  }
};

// clientController.js - add this new function
export const getClientEarningsReport = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Get all projects for this client
    const projects = await Project.find({ client_id: id });
    const projectIds = projects.map((p) => p._id);

    // Get all subtasks across those projects
    const subtasks = await SubTask.find({ project_id: { $in: projectIds } });

    // Build report
    const projectBreakdown = projects.map((project) => {
      const projectSubtasks = subtasks.filter(
        (s) => s.project_id.toString() === project._id.toString()
      );

      const subtaskBreakdown = projectSubtasks.map((subtask) => ({
        subtask_id: subtask._id,
        task_name: subtask.task_name,
        status: subtask.status,
        total_price: subtask.total_price || 0,
        earned_amount: subtask.earned_amount || 0,
        pending_amount: (subtask.total_price || 0) - (subtask.earned_amount || 0),
        stages: subtask.stages.map((stage) => ({
          stage_name: stage.name,
          price: stage.price || 0,
          completed: stage.completed,
          completed_at: stage.completed_at || null,
        })),
      }));

      const projectTotal = subtaskBreakdown.reduce((s, t) => s + t.total_price, 0);
      const projectEarned = subtaskBreakdown.reduce((s, t) => s + t.earned_amount, 0);

      return {
        project_id: project._id,
        project_name: project.project_name,
        status: project.status,
        total_value: projectTotal,
        earned_value: projectEarned,
        pending_value: projectTotal - projectEarned,
        subtasks: subtaskBreakdown,
      };
    });

    // Grand totals
    const grandTotal = projectBreakdown.reduce((s, p) => s + p.total_value, 0);
    const grandEarned = projectBreakdown.reduce((s, p) => s + p.earned_value, 0);

    res.json({
      client_id: id,
      client_name: client.full_name,
      company_name: client.company_name,
      stage_pricing: client.stage_pricing, // show what defaults were set
      summary: {
        total_value: grandTotal,
        earned_value: grandEarned,
        pending_value: grandTotal - grandEarned,
        completion_percentage:
          grandTotal > 0
            ? Math.round((grandEarned / grandTotal) * 100)
            : 0,
        total_projects: projects.length,
        total_subtasks: subtasks.length,
      },
      projects: projectBreakdown,
    });
  } catch (error) {
    console.error("getClientEarningsReport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};