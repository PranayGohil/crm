import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const departmentOptions = ["SET Design", "CAD Design", "Render"];
const employmentTypes = ["Full-time", "Part-time"];

const CreateEmployeeProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    full_name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    home_address: "",
    dob: "",
    department: "",
    designation: "",
    employment_type: "Select Employment Type",
    reporting_manager: "",
    date_of_joining: "",
    monthly_salary: "",
    emergency_contact: "",
    capacity: "",
    is_manager: false,
  };

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    username: Yup.string()
      .matches(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores (_) and dashes (-).",
      })
      .required("Username is required")
      .test(
        "checkDuplicateUsername",
        "Username already exists. Please choose another.",
        async function (value) {
          if (!value) return true; // skip empty (other rules will catch required)
          try {
            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/employee/check-username`,
              { username: value }
            );
            return res.data.available; // ✅ should return true if available
          } catch (err) {
            console.error("Error checking username", err);
            return this.createError({
              message: "Server error validating username",
            });
          }
        }
      ),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      ),
    cnf_password: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    home_address: Yup.string().required("Address is required"),
    dob: Yup.string().required("Date of birth is required"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    employment_type: Yup.string().required("Employment type is required"),
    reporting_manager: Yup.string().nullable(),
    date_of_joining: Yup.string().required("Date of joining is required"),
    monthly_salary: Yup.number()
      .typeError("Must be a number")
      .required("Monthly salary is required"),
    is_manager: Yup.boolean(),
  });

  // fetch managers
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/employee/managers`)
      .then((res) => {
        if (res.data.success) setManagers(res.data.data);
      })
      .catch((err) => console.error("Error fetching managers", err));
  }, []);

  // fetch designations
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`)
      .then((res) => {
        if (res.data.success) setDesignations(res.data.designations);
      })
      .catch((err) => console.error("Error fetching designations", err));
  }, []);

  const handleFileChange = (e, setFieldValue) => {
    if (e.target.files[0]) {
      setProfilePreview(e.target.files[0]);
      setFieldValue("profile_pic", e.target.files[0]);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <section className="container mx-auto p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setLoading(true);
          try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
              if (key !== "profile_pic") {
                formData.append(
                  key,
                  typeof val === "boolean" ? val.toString() : val
                );
              }
            });

            if (profilePreview && typeof profilePreview !== "string") {
              formData.append("profile_pic", profilePreview);
            }

            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/employee/add`,
              formData
            );

            if (res.data.success) {
              alert("Employee created successfully!");
              resetForm(); // ✅ reset only on success
              navigate("/employee/dashboard");
            } else {
              alert(res.data.message);
            }
          } catch (err) {
            console.error("Failed to create employee:", err);
            alert("Failed to create employee");
          } finally {
            setLoading(false);
            setSubmitting(false); // ✅ stop Formik submission state
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <img src="/SVG/arrow-pc.svg" alt="back" className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold">Add New Employee</h1>
            </div>

            {/* Profile & Full name */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-5">
              <label
                htmlFor="profilePic"
                className="cursor-pointer w-24 h-24 rounded-full border overflow-hidden flex items-center justify-center bg-gray-100"
              >
                {profilePreview ? (
                  <img
                    src={
                      typeof profilePreview === "string"
                        ? profilePreview
                        : URL.createObjectURL(profilePreview)
                    }
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={"/SVG/upload-vec.svg"}
                    alt="upload"
                    className="w-10 h-10"
                  />
                )}
              </label>
              <input
                type="file"
                id="profilePic"
                hidden
                onChange={(e) => handleFileChange(e, setFieldValue)}
              />

              <div className="flex-1 w-full row">
                <div className="col-md-6">
                  <label className="block text-sm font-medium">Full Name</label>
                  <Field
                    name="full_name"
                    type="text"
                    className="w-full mt-1 p-2 border rounded"
                  />
                  <ErrorMessage
                    name="full_name"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="col-md-6">
                  <label className="block text-sm font-medium">Username</label>
                  <Field
                    type="text"
                    name={"username"}
                    className="w-full mt-1 p-2 border rounded"
                  />
                  <ErrorMessage
                    name={"username"}
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="col-md-6">
                  <label className="block text-sm font-medium">Password</label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="w-full mt-1 p-2 border rounded"
                      placeholder="Enter password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="col-md-6">
                  <label className="block text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="cnf_password"
                      className="w-full mt-1 p-2 border rounded"
                      placeholder="Enter confirm password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <ErrorMessage
                    name="cnf_password"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="row">
              {/* Left column */}
              <div className="col-md-6 space-y-4">
                {[
                  "email",
                  "phone",
                  "home_address",
                  "dob",
                  "emergency_contact",
                  "capacity",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">
                      {field.replace("_", " ").toUpperCase()}
                    </label>
                    <Field
                      type={field === "dob" ? "date" : "text"}
                      name={field}
                      className="w-full mt-1 p-2 border rounded"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="col-md-6 space-y-4">
                {["department", "employment_type", "designation"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium">
                        {field.replace("_", " ").toUpperCase()}
                      </label>
                      <select
                        name={field}
                        value={values[field]}
                        onChange={(e) => setFieldValue(field, e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="">
                          Select {field.replace("_", " ")}
                        </option>
                        {(field === "department"
                          ? departmentOptions
                          : field === "designation"
                          ? designations.map((d) => d.name)
                          : employmentTypes
                        ).map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ErrorMessage
                        name={field}
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  )
                )}

                <div>
                  <label className="block text-sm font-medium">
                    Reporting Manager
                  </label>
                  <select
                    name="reporting_manager"
                    value={values.reporting_manager}
                    onChange={(e) =>
                      setFieldValue("reporting_manager", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="">Select Reporting Manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage
                    name="reporting_manager"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {["date_of_joining", "monthly_salary"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">
                      {field.replace(/_/g, " ").toUpperCase()}
                    </label>
                    <Field
                      type={field === "monthly_salary" ? "number" : "date"}
                      name={field}
                      className="w-full mt-1 p-2 border rounded"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Field
                    type="checkbox"
                    name="is_manager"
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Is Reporting Manager</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
              >
                Add Employee
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default CreateEmployeeProfile;
