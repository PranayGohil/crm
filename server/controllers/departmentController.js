import Department from "../models/departmentModel.js";
import ActivityLogger from "../utils/activityLogger.js";

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

    // 📝 LOG ACTIVITY - Admin created a new department
    const logger = new ActivityLogger(req);

    await logger.log('CREATE_DEPARTMENT', {
      entity: {
        id: department._id,
        name: department.name,
        type: 'department'
      },
      changes: {
        after: {
          name: department.name
        }
      },
      metadata: {
        departmentName: department.name
      },
      description: `Created new department "${department.name}"`,
      severity: 'info'
    });

    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create department" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get department before deletion for logging
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if department is being used by any employees
    const Employee = (await import("../models/employeeModel.js")).default;
    const employeesInDepartment = await Employee.countDocuments({ department: department.name });

    await Department.findByIdAndDelete(id);

    // 📝 LOG ACTIVITY - Admin deleted a department
    const logger = new ActivityLogger(req);

    await logger.log('DELETE_DEPARTMENT', {
      entity: {
        id: department._id,
        name: department.name,
        type: 'department'
      },
      metadata: {
        departmentName: department.name,
        employeesUsingIt: employeesInDepartment
      },
      description: `Deleted department "${department.name}"${employeesInDepartment > 0 ? ` (was used by ${employeesInDepartment} employees)` : ''}`,
      severity: employeesInDepartment > 0 ? 'warning' : 'info'
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
      warning: employeesInDepartment > 0 ? `This department was used by ${employeesInDepartment} employees. They may need to be updated.` : null
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Failed to delete department" });
  }
};
