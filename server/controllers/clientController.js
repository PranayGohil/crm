import Client from "../models/clientModel.js";
import SubTask from "../models/subTaskModel.js";
import Bcrypt from "bcrypt";

export const addClient = async (req, res) => {
  try {
    console.log(req.body);
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
    } = req.body;

    // 👉 Check if username already exists
    const existingUsername = await Client.findOne({ username });
    if (existingUsername) {
      return res.json({
        success: false,
        message: "Username already exists. Please choose another.",
      });
    }

    // (Optional) Also check for email
    const existingEmail = await Client.findOne({ email });
    if (existingEmail) {
      return res.json({
        success: false,
        message: "Email already exists. Please use another email.",
      });
    }

    // Hash the password
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(password, salt);

    const client = await Client.create({
      full_name,
      email,
      phone,
      joining_date,
      address,
      username,
      client_type,
      password: hashedPassword,
      company_name,
      gst_number,
      business_phone,
      website,
      linkedin,
      business_address,
      additional_notes,
    });

    res.status(200).json({ success: true, message: "Client added successfully", client });
  } catch (error) {
    console.error("Error in addClient:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { usename, password } = req.body;
    const client = await Client.findOne({ usename });
    if (!client) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await Bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Error in loginClient:", error);
    res.status(500).json({ error: "Server error" });
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
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    res.status(200).json(client);
  } catch (error) {
    console.error("Error in deleteClient:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getClientTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await SubTask.find({ asign_to: { role: "client", id: id } });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error in getClientTasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};
