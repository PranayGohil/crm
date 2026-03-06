import Designation from "../models/designationModel.js";
import ActivityLogger from "../utils/activityLogger.js";

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

    // 📝 LOG ACTIVITY - Admin created a new designation
    const logger = new ActivityLogger(req);

    await logger.log('CREATE_DESIGNATION', {
      entity: {
        id: designation._id,
        name: designation.name,
        type: 'designation'
      },
      changes: {
        after: {
          name: designation.name
        }
      },
      metadata: {
        designationName: designation.name
      },
      description: `Created new designation "${designation.name}"`,
      severity: 'info'
    });

    res.status(201).json(designation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create designation" });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    // Get designation before deletion for logging
    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    // Check if designation is being used by any employees
    const Employee = (await import("../models/employeeModel.js")).default;
    const employeesWithDesignation = await Employee.countDocuments({ designation: designation.name });

    await Designation.findByIdAndDelete(id);

    // 📝 LOG ACTIVITY - Admin deleted a designation
    const logger = new ActivityLogger(req);

    await logger.log('DELETE_DESIGNATION', {
      entity: {
        id: designation._id,
        name: designation.name,
        type: 'designation'
      },
      metadata: {
        designationName: designation.name,
        employeesUsingIt: employeesWithDesignation
      },
      description: `Deleted designation "${designation.name}"${employeesWithDesignation > 0 ? ` (was used by ${employeesWithDesignation} employees)` : ''}`,
      severity: employeesWithDesignation > 0 ? 'warning' : 'info'
    });

    res.json({
      success: true,
      message: "Designation deleted successfully",
      warning: employeesWithDesignation > 0 ? `This designation was used by ${employeesWithDesignation} employees. They may need to be updated.` : null
    });
  } catch (error) {
    console.error("Error deleting designation:", error);
    res.status(500).json({ message: "Failed to delete designation" });
  }
};
