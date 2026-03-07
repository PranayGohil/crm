import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { stageOptions } from "../../../options";

const employmentTypes = ["Full-time", "Part-time"];

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const errCls = "text-red-600 text-xs mt-1";

const CreateEmployeeProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    full_name: "", username: "", password: "", cnf_password: "",
    email: "", phone: "", home_address: "", dob: "",
    department: "", designation: "", employment_type: "",
    reporting_manager: "", date_of_joining: "", monthly_salary: "",
    emergency_contact: "", capacity: "", is_manager: false,
    manage_stages: [], profile_pic: null,
  };

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    username: Yup.string().matches(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only").required("Username is required")
      .test("checkDuplicate", "Username already exists.", async function (value) {
        if (!value) return true;
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/employee/check-username`, { username: value }, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          return res.data.available;
        } catch { return this.createError({ message: "Server error validating username" }); }
      }),
    password: Yup.string().required("Password is required").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, "Min 8 chars, uppercase, lowercase, number & special character."),
    cnf_password: Yup.string().required("Confirm password is required").oneOf([Yup.ref("password"), null], "Passwords must match"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    home_address: Yup.string().required("Address is required"),
    dob: Yup.string().required("Date of birth is required"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    employment_type: Yup.string().required("Employment type is required"),
    date_of_joining: Yup.string().required("Date of joining is required"),
    monthly_salary: Yup.number().typeError("Must be a number").required("Monthly salary is required"),
    manage_stages: Yup.array().when("is_manager", {
      is: true, then: (s) => s.min(1, "Select at least one stage"), otherwise: (s) => s.notRequired(),
    }),
  });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/employee/managers`).then((r) => { if (r.data.success) setManagers(r.data.data); }).catch(console.error);
    axios.get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`).then((r) => { if (r.data.success) setDesignations(r.data.designations); }).catch(console.error);
    axios.get(`${process.env.REACT_APP_API_URL}/api/department/get-all`).then((r) => { if (r.data.success) setDepartments(r.data.departments); }).catch(console.error);
  }, []);

  const handleFileChange = (e, setFieldValue) => {
    if (e.target.files[0]) { setProfilePreview(e.target.files[0]); setFieldValue("profile_pic", e.target.files[0]); }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key !== "profile_pic" && val !== null) {
          if (Array.isArray(val)) val.forEach((v) => formData.append(`${key}[]`, v));
          else formData.append(key, typeof val === "boolean" ? val.toString() : val);
        }
      });
      if (profilePreview && typeof profilePreview !== "string") formData.append("profile_pic", profilePreview);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/employee/add`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) { toast.success("Employee created successfully!"); resetForm(); navigate("/employee/dashboard"); }
      else toast.error(res.data.message);
    } catch (err) { console.error(err); toast.error("Failed to create employee"); }
    finally { setLoading(false); setSubmitting(false); }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Add New Employee</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
          {({ setFieldValue, values }) => (
            <Form className="space-y-6">

              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <label htmlFor="profilePic"
                  className="cursor-pointer w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-100 mb-2">
                  {profilePreview ? (
                    <img src={typeof profilePreview === "string" ? profilePreview : URL.createObjectURL(profilePreview)} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-xs text-gray-500">Upload Photo</span>
                    </div>
                  )}
                </label>
                <input type="file" id="profilePic" hidden onChange={(e) => handleFileChange(e, setFieldValue)} />
                <p className="text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
              </div>

              {/* Form fields — single column on mobile, 2 cols on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                {/* Personal Info */}
                <div className="sm:col-span-2">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-1 border-b border-gray-100">Personal Information</h2>
                </div>

                <div>
                  <label className={labelCls}>Full Name</label>
                  <Field name="full_name" type="text" className={inputCls} />
                  <ErrorMessage name="full_name" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Username</label>
                  <Field name="username" type="text" className={inputCls} />
                  <ErrorMessage name="username" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <Field type={showPassword ? "text" : "password"} name="password" className={inputCls} placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <Field type={showPassword ? "text" : "password"} name="cnf_password" className={inputCls} placeholder="Confirm password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage name="cnf_password" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <Field type="email" name="email" className={inputCls} />
                  <ErrorMessage name="email" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <Field type="text" name="phone" className={inputCls} />
                  <ErrorMessage name="phone" component="div" className={errCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Home Address</label>
                  <Field type="text" name="home_address" className={inputCls} />
                  <ErrorMessage name="home_address" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <Field type="date" name="dob" className={inputCls} />
                  <ErrorMessage name="dob" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Emergency Contact</label>
                  <Field type="text" name="emergency_contact" className={inputCls} />
                  <ErrorMessage name="emergency_contact" component="div" className={errCls} />
                </div>

                {/* Professional Info */}
                <div className="sm:col-span-2">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2 mb-3 pb-1 border-b border-gray-100">Professional Information</h2>
                </div>

                <div>
                  <label className={labelCls}>Department</label>
                  <Field as="select" name="department" className={inputCls}>
                    <option value="">Select Department</option>
                    {departments.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                  </Field>
                  <ErrorMessage name="department" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Designation</label>
                  <Field as="select" name="designation" className={inputCls}>
                    <option value="">Select Designation</option>
                    {designations.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                  </Field>
                  <ErrorMessage name="designation" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Employment Type</label>
                  <Field as="select" name="employment_type" className={inputCls}>
                    <option value="">Select Employment Type</option>
                    {employmentTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </Field>
                  <ErrorMessage name="employment_type" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Reporting Manager</label>
                  <Field as="select" name="reporting_manager" className={inputCls}>
                    <option value="">Select Reporting Manager</option>
                    {managers.map((m) => <option key={m._id} value={m._id}>{m.full_name}</option>)}
                  </Field>
                  <ErrorMessage name="reporting_manager" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Joining</label>
                  <Field type="date" name="date_of_joining" className={inputCls} />
                  <ErrorMessage name="date_of_joining" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Monthly Salary</label>
                  <Field type="number" name="monthly_salary" className={inputCls} />
                  <ErrorMessage name="monthly_salary" component="div" className={errCls} />
                </div>
                <div>
                  <label className={labelCls}>Capacity</label>
                  <Field type="number" name="capacity" className={inputCls} />
                  <ErrorMessage name="capacity" component="div" className={errCls} />
                </div>

                {/* Manager toggle + stages */}
                <div className="sm:col-span-2 flex items-center gap-2">
                  <Field type="checkbox" name="is_manager" id="is_manager" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="is_manager" className="text-sm text-gray-700">Is Reporting Manager</label>
                </div>
                {values.is_manager && (
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Manage Stages</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {stageOptions.map((stage, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <Field type="checkbox" name="manage_stages" value={stage} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                          {stage}
                        </label>
                      ))}
                    </div>
                    <ErrorMessage name="manage_stages" component="div" className={errCls} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <button type="reset" className="w-full sm:w-auto px-5 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Reset Form
                </button>
                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Employee
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateEmployeeProfile;