import mongoose from "mongoose";

const employeeSchema = mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  full_name: {
    type: String,
  },
  designation: {
    type: String,
  },
  status: {
    type: String,
  },
  profile_pic: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  home_address: {
    type: String,
  },
  dob: {
    type: Date,
  },
  emergency_contact: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  department: {
    type: String,
  },
  date_of_joining: {
    type: Date,
  },
  monthly_salary: {
    type: Number,
  },
  employment_type: {
    type: String,
  },
  reporting_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  is_manager: { type: Boolean, default: false },
  manage_stages: [{ type: String }],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Unique login lookup (already created via unique:true, but explicit is fine)
employeeSchema.index(
  { username: 1 },
  { unique: true, name: "idx_employee_username" }
);

employeeSchema.index(
  { reporting_manager: 1 },
  { name: "idx_employee_reporting_manager" }
);

employeeSchema.index(
  { is_manager: 1 },
  { name: "idx_employee_is_manager" }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
