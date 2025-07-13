import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateMemberHeader from "../../../components/CreateMemberHeader";
import CreateProfileSection from "../../../components/CreateProfileSection";
import CreatePersonalProfessionalDetails from "../../../components/CreatePersonalProfessionalDetails";
import CreateLoginSecuritySettings from "../../../components/CreateLoginSecuritySettings";

const CreateEmployeeProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    designation: "",
    status: "",
    phone: "",
    email: "",
    home_address: "",
    dob: "",
    emrgency_contact: "",
    employee_id: "",
    department: "",
    date_of_joining: "",
    monthly_salary: "",
    employement_type: "",
    reporting_manager: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    else if (!/\d/.test(form.password))
      newErrors.password = "Password must include a number.";
    else if (!/[!@#$%^&*]/.test(form.password))
      newErrors.password = "Password must include a special character.";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (!form.designation) newErrors.designation = "Select designation.";
    if (!form.status) newErrors.status = "Select status.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+?\d{10,15}$/.test(form.phone))
      newErrors.phone = "Enter valid phone number.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email.";
    if (!form.home_address.trim())
      newErrors.home_address = "Address is required.";
    if (!form.dob) newErrors.dob = "Date of birth is required.";
    if (!form.emrgency_contact.trim())
      newErrors.emrgency_contact = "Emergency contact is required.";
    if (!form.employee_id.trim())
      newErrors.employee_id = "Employee ID is required.";
    if (!form.department) newErrors.department = "Select department.";
    if (!form.date_of_joining)
      newErrors.date_of_joining = "Date of joining required.";
    if (!form.monthly_salary.trim())
      newErrors.monthly_salary = "Salary required.";
    else if (isNaN(Number(form.monthly_salary)))
      newErrors.monthly_salary = "Salary must be a number.";
    if (!form.employement_type)
      newErrors.employement_type = "Select employment type.";
    if (!form.reporting_manager)
      newErrors.reporting_manager = "Select reporting manager.";

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (profilePic) data.append("profile_pic", profilePic);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/employee/add`,
        data
      );
      if (res.data.success) {
        navigate("/teammemberdashboard");
      } else {
        setErrors({ general: res.data.message || "Unknown error" });
      }
    } catch (err) {
      console.error(err);
      setErrors({
        general: "Error: " + (err?.response?.data?.message || "Unknown error"),
      });
    }
  };

  return (
    <section className="employee_profile_edit_container">
      <CreateMemberHeader onSave={handleSubmit} />
      {errors.general && (
        <div style={{ color: "red", marginLeft: "20px", marginTop: "10px" }}>
          {errors.general}
        </div>
      )}

      <CreateProfileSection
        form={form}
        onChange={handleChange}
        setProfilePic={setProfilePic}
        errors={errors}
      />
      <CreatePersonalProfessionalDetails
        form={form}
        onChange={handleChange}
        errors={errors}
      />
      <CreateLoginSecuritySettings
        form={form}
        onChange={handleChange}
        errors={errors}
        onSave={handleSubmit}
      />
    </section>
  );
};

export default CreateEmployeeProfile;
