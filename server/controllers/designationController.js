import Designation from "../models/designationModel.js";

export const getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ createdAt: -1 });
    res.json({ success: true, designations });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designations" });
  }
};

export const addDesignation = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Designation name", name);
    if (!name?.trim())
      return res.status(400).json({ message: "Name is required" });

    const existing = await Designation.findOne({ name: name.trim() });
    if (existing)
      return res.status(409).json({ message: "Designation already exists" });

    const designation = await Designation.create({ name: name.trim() });
    res.status(201).json(designation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create designation" });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    await Designation.findByIdAndDelete(id);
    res.json({ message: "Designation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete designation" });
  }
};
