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
  emrgency_contact: {
    type: String,
  },
  employee_id: {
    type: String,
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
  employement_type: {
    type: String,
  },
  reporting_manager: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;