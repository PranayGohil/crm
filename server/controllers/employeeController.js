import Employee from "../models/employeeModel.js";
import SubTask from "../models/subTaskModel.js";
import Bcrypt from "bcrypt";

export const addEmployee = async (req, res) => {
  try {
    const {
      username,
      password,
      full_name,
      designation,
      status,
      phone,
      email,
      home_address,
      dob,
      emrgency_contact,
      employee_id,
      department,
      date_of_joining,
      monthly_salary,
      employement_type,
      reporting_manager,
    } = req.body;

    // ✅ Check if username already exists
    const existingUser = await Employee.findOne({ username });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Username already exists. Please choose another.",
      });
    }

    // ✅ Hash password
    const hashedPassword = await Bcrypt.hash(password, 10);

    // ✅ Create new employee
    const newEmployee = new Employee({
      username, // fixed typo (was 'username')
      password: hashedPassword,
      full_name,
      designation,
      status,
      profile_pic: req.file ? req.file.path : null,
      phone,
      email,
      home_address,
      dob,
      emrgency_contact,
      employee_id,
      department,
      date_of_joining,
      monthly_salary,
      employement_type,
      reporting_manager,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginEmployee = async (req, res) => {
  const { username, password } = req.body;
  const employee = await Employee.findOne({ username });
  if (!employee) {
    return res.status(400).json({ error: "User not found" });
  }
  const isMatch = await Bcrypt.compare(password, employee.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  res.status(200).json(employee);
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(
      {},
      "_id full_name email status designation department phone monthly_salary profile_pic"
    );
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const getMultipleEmployees = async (req, res) => {
  try {
    const ids = req.query.ids?.split(",");
    if (!ids || ids.length === 0) return res.json([]);
    const employees = await Employee.find({ _id: { $in: ids } });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

export const getEmployeeInfo = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);
  res.status(200).json(employee);
};

export const editEmployee = async (req, res) => {
  try {
    const { id } = req.params; // assuming route is: PUT /api/employees/:id

    const {
      username,
      full_name,
      designation,
      status,
      phone,
      email,
      home_address,
      dob,
      emrgency_contact,
      employee_id,
      department,
      date_of_joining,
      monthly_salary,
      employement_type,
      reporting_manager,
    } = req.body;

    // ✅ Find employee by id
    const employee = await Employee.findById(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // ✅ Check if username is being changed & already exists
    if (username && username !== employee.username) {
      const existingUser = await Employee.findOne({ username });
      if (existingUser) {
        return res.json({
          success: false,
          message: "Username already exists. Please choose another.",
        });
      }
      employee.username = username;
    }

    // ✅ Update fields
    employee.full_name = full_name || employee.full_name;
    employee.designation = designation || employee.designation;
    employee.status = status || employee.status;
    employee.phone = phone || employee.phone;
    employee.email = email || employee.email;
    employee.home_address = home_address || employee.home_address;
    employee.dob = dob || employee.dob;
    employee.emrgency_contact = emrgency_contact || employee.emrgency_contact;
    employee.employee_id = employee_id || employee.employee_id;
    employee.department = department || employee.department;
    employee.date_of_joining = date_of_joining || employee.date_of_joining;
    employee.monthly_salary = monthly_salary || employee.monthly_salary;
    employee.employement_type = employement_type || employee.employement_type;
    employee.reporting_manager =
      reporting_manager || employee.reporting_manager;

    // ✅ If new profile_pic uploaded, update it
    if (req.file) {
      employee.profile_pic = req.file.path;
    }

    await employee.save();

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findByIdAndDelete(id);
  res.status(200).json(employee);
};

export const getEmployeeTasks = async (req, res) => {
  const { id } = req.params;
  const tasks = await SubTask.find({ assign_to: { role: "employee", id: id } });
  res.status(200).json(tasks);
};
