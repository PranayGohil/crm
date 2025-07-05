import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateMemberHeader from "../components/CreateMemberHeader";
import CreateProfileSection from "../components/CreateProfileSection";
import CreatePersonalProfessionalDetails from "../components/CreatePersonalProfessionalDetails";
import CreateLoginSecuritySettings from "../components/CreateLoginSecuritySettings";

const CreateEmployeeProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    designation: "Senior Developer",
    status: "Active",
    phone: "",
    email: "",
    home_address: "",
    dob: "",
    emrgency_contact: "",
    employee_id: "",
    department: "Engineering",
    date_of_joining: "",
    monthly_salary: "",
    employement_type: "Full-time",
    reporting_manager: "Sarah Johnson (CTO)",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (profilePic) data.append("profile_pic", profilePic);
      await axios
        .post(`${process.env.REACT_APP_API_URL}/api/employee/add`, data)
        .then((res) => {
          if (res.data.success) {
            navigate("/teammemberdashboard");
          } else {
            setErrors(res.data.message);
          }
        })
        .catch((err) => {
          setErrors("Error : ", err.response.data);
        });
    } catch (err) {
      console.error(err);
      alert("Error creating employee");
    }
  };

  return (
    <section className="employee_profile_edit_container">
      <CreateMemberHeader onSave={handleSubmit} />
      <div style={{ color: "red", marginLeft: "20px", marginTop: "10px" }}>{errors}</div>
      <CreateProfileSection
        form={form}
        onChange={handleChange}
        setProfilePic={setProfilePic}
      />
      <CreatePersonalProfessionalDetails form={form} onChange={handleChange} />
      <CreateLoginSecuritySettings form={form} onChange={handleChange} />
    </section>
  );
};

export default CreateEmployeeProfile;
