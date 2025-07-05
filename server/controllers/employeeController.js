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
      return res
        .json({ success: false, message: "Username already exists. Please choose another." });
    }

    // ✅ Hash password
    const hashedPassword = await Bcrypt.hash(password, 10);

    // ✅ Create new employee
    const newEmployee = new Employee({
      username, // fixed typo (was 'usename')
      password: hashedPassword,
      full_name,
      designation,
      status,
      profile_pic: req.file ? req.file.filename : null,
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
  const { usename, password } = req.body;
  const employee = await Employee.findOne({ usename });
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
  const employees = await Employee.find();
  res.status(200).json(employees);
};

export const getEmployeeInfo = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);
  res.status(200).json(employee);
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findByIdAndUpdate(id, req.body);
  res.status(200).json(employee);
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findByIdAndDelete(id);
  res.status(200).json(employee);
};

export const getEmployeeTasks = async (req, res) => {
  const { id } = req.params;
  const tasks = await SubTask.find({ asign_to: { role: "employee", id: id } });
  res.status(200).json(tasks);
};
