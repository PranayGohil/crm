import Department from "../models/departmentModel.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

export const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Department name", name);
    if (!name?.trim())
      return res.status(400).json({ message: "Name is required" });

    const existing = await Department.findOne({ name: name.trim() });
    if (existing)
      return res.status(409).json({ message: "Department already exists" });

    const department = await Department.create({ name: name.trim() });
    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create department" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department" });
  }
};
