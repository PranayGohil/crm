import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

import { FaEye, FaEyeSlash } from "react-icons/fa";
const dropdownOptions = ["Active", "Inactive", "Blocked"];
const departmentOptions = ["SET Design", "CAD Design", "Render"];
const employmentTypes = ["Full-time", "Part-time"];
const EmployeeProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const dropdownRefs = useRef({});
  const [profilePreview, setProfilePreview] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [initialValues, setInitialValues] = useState({
    full_name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    home_address: "",
    dob: "",
    department: "",
    designation: "",
    status: "Active",
    employment_type: "Select Employment Type",
    reportingManager: "Select Manager",
    date_of_joining: "",
    monthly_salary: "",
    emergency_contact: "",
    capacity: "",
    is_manager: false,
  });

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    username: Yup.string()
      .matches(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores (_) and dashes (-).",
        excludeEmptyString: true,
      })
      .required("Username is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character."
      ),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    home_address: Yup.string().required("Address is required"),
    dob: Yup.string().required("Date of birth is required"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    status: Yup.string().required("Status is required"),
    employment_type: Yup.string().required("Employment type is required"),
    reportingManager: Yup.string().required("Reporting manager is required"),
    date_of_joining: Yup.string().required("Date of joining is required"),
    monthly_salary: Yup.number()
      .typeError("Must be a number")
      .required("Monthly salary is required"),
    is_manager: Yup.boolean(),
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get/${employeeId}`
        );
        const data = res.data;
        setInitialValues({
          full_name: data.full_name || "",
          username: data.username || "",
          password: data.password || "",
          email: data.email || "",
          phone: data.phone || "",
          home_address: data.home_address || "",
          dob: data.dob ? data.dob.split("T")[0] : "",
          department: data.department || "",
          designation: data.designation || "",
          status: data.status || "Active",
          employment_type: data.employment_type || employmentTypes[0],
          reportingManager: data.reportingManager || "Select Manager",
          date_of_joining: data.date_of_joining
            ? data.date_of_joining.split("T")[0]
            : "",
          monthly_salary: data.monthly_salary || "",
          emergency_contact: data.emergency_contact || "",
          capacity: data.capacity || "",
          is_manager: data.is_manager || false,
        });
        setProfilePreview(data.profile_pic || null);
      } catch (err) {
        console.error("Error fetching employee:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/employee/managers`)
      .then((res) => {
        if (res.data.success) {
          console.log("Managers:", res.data.data);
          setManagers(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching managers", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`)
      .then((res) => {
        if (res.data.success) {
          console.log("get all designations", res.data.designations);
          setDesignations(res.data.designations);
        } else {
          console.error("Failed to fetch designations");
        }
      })
      .catch((err) => console.error("Error fetching designations", err));
  }, []);

  const toggleDropdown = (field) => {
    setOpenDropdown((prev) => (prev === field ? null : field));
  };

  const handleSelect = (field, value, setFieldValue) => {
    setFieldValue(field, value);
    setOpenDropdown(null);
  };

  const handleFileChange = (e, setFieldValue) => {
    if (e.target.files[0]) {
      setProfilePreview(e.target.files[0]);
      setFieldValue("profile_pic", e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElements = Object.values(dropdownRefs.current);
      const clickedOutside = dropdownElements.every((ref) => {
        return ref?.contains instanceof Function && !ref.contains(event.target);
      });

      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) return <LoadingOverlay />;

  return (
    <section className="employee_profile_edit_container container-fluide p-3">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => {
              if (typeof val === "boolean") {
                formData.append(key, val.toString()); // Convert boolean to string
              } else {
                formData.append(key, val);
              }
            });

            if (profilePreview && typeof profilePreview !== "string") {
              console.log("Appending profile pic to formData", profilePreview);
              formData.append("profile_pic", profilePreview);
            }
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/employee/edit/${employeeId}`,
              formData
            );
            alert("Profile updated!");
            navigate(`/employee/profile/${employeeId}`);
          } catch (err) {
            console.error("Failed to update:", err);
            alert("Update failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <Form>
            {/* Top section */}
            <section className="page3-main1">
              <div className="member-profile-edit">
                <div className="anp-header-inner">
                  <div className="anp-heading-main">
                    <div
                      className="anp-back-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(-1);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src="/SVG/arrow-pc.svg"
                        alt="back"
                        className="mx-2"
                        style={{ scale: "1.3" }}
                      />
                    </div>
                    <div className="head-menu">
                      <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                        Edit Employee Profile{" "}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Profile pic */}
            <section className="pe page3-main2">
              <div className="update-upload-profile">
                <div className="update-your-pro">
                  <div className="upadate-profile-img">
                    <label
                      htmlFor="profilePic"
                      className="update-img"
                      style={{
                        cursor: "pointer",
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid #d1d5db",
                      }}
                    >
                      {profilePreview ? (
                        <img
                          src={
                            typeof profilePreview === "string"
                              ? profilePreview
                              : URL.createObjectURL(profilePreview)
                          }
                          style={{
                            width: "100%",
                            objectFit: "cover",
                            height: "100%",
                          }}
                          alt="profile"
                        />
                      ) : (
                        <img
                          src={"/SVG/upload-vec.svg"}
                          alt="upload"
                          style={{
                            width: "100%",
                            objectFit: "cover",
                            height: "100%",
                          }}
                        />
                      )}
                    </label>
                    <input
                      type="file"
                      id="profilePic"
                      hidden
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                    />
                  </div>
                  <div className="update-profile-detail">
                    <div className="full-name">
                      <span>Full Name</span>
                      <Field type="text" name="full_name" />
                      <ErrorMessage
                        name="full_name"
                        component="div"
                        className="error"
                      />
                    </div>

                    {/* Dropdowns */}
                    <div className="update-dropdown" ref={dropdownRefs}>
                      {["designation", "status"].map((field) => {
                        const options =
                          field === "designation"
                            ? designations.map((d) => d.name)
                            : dropdownOptions;

                        return (
                          <div
                            key={field}
                            className={`btn_main1 ${
                              openDropdown === field ? "open" : ""
                            }`}
                          >
                            <p>
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </p>
                            <div
                              className="dropdown_toggle1"
                              onClick={() =>
                                toggleDropdown(field, setFieldValue)
                              }
                            >
                              <div className="t-b-inner">
                                <span className="text_btn1">
                                  {values[field]}
                                </span>
                                <img
                                  src="/SVG/header-vector.svg"
                                  alt="vec"
                                  className="arrow_icon1"
                                />
                              </div>
                            </div>
                            {openDropdown === field && (
                              <ul className="dropdown_menu1">
                                {options.map((option, idx) => (
                                  <li
                                    key={idx}
                                    onClick={() =>
                                      handleSelect(field, option, setFieldValue)
                                    }
                                  >
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <ErrorMessage
                              name={field}
                              component="div"
                              className="error"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Personal Details */}
            <section className="row py-3 px-5">
              <div className="col-md-6">
                {[
                  "email",
                  "phone",
                  "home_address",
                  "dob",
                  "emergency_contact",
                  "capacity",
                  "username",
                ].map((field) => (
                  <div className="profile-edit-inner mb-3" key={field}>
                    <div className="profile-edit-detail">
                      <span>{field.replace("_", " ").toUpperCase()}</span>
                      <Field
                        type={field === "dob" ? "date" : "text"}
                        name={field}
                      />
                      <ErrorMessage
                        name={field}
                        component="div"
                        className="error"
                      />
                    </div>
                  </div>
                ))}
                <div className="profile-edit-inner">
                  <div className="profile-edit-detail">
                    <span>Password</span>
                    <div style={{ position: "relative", width: "fit-content" }}>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                      />

                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error"
                    style={{ width: "494px" }}
                  />
                </div>
              </div>

              {/* Professional Details with dropdowns */}
              <div className="col-md-6">
                {["department", "reportingManager", "employment_type"].map(
                  (field) => (
                    <div
                      key={field}
                      className="profile-edit-inner mb-3"
                      ref={(el) => {
                        if (el) dropdownRefs.current[field] = el;
                      }}
                    >
                      <div className="Department emp-detail mail-txt">
                        <p>{field.replace("_", " ").toUpperCase()}</p>
                        <div
                          className="dropdown_toggle2"
                          onClick={() => toggleDropdown(field)}
                        >
                          <span className="text_btn2">{values[field]}</span>
                          <img
                            src="/SVG/header-vector.svg"
                            alt="vec"
                            className="arrow_icon2"
                          />
                        </div>
                        {openDropdown === field && (
                          <ul className="dropdown_menu2">
                            {(field === "department"
                              ? departmentOptions
                              : field === "reportingManager"
                              ? managers.map((m) => m.full_name)
                              : employmentTypes
                            ).map((option, idx) => (
                              <li
                                key={idx}
                                onClick={() =>
                                  handleSelect(field, option, setFieldValue)
                                }
                              >
                                {option}
                              </li>
                            ))}
                          </ul>
                        )}
                        <ErrorMessage
                          name={field}
                          component="div"
                          className="error"
                        />
                      </div>
                    </div>
                  )
                )}

                {["date_of_joining", "monthly_salary"].map((field) => (
                  <div
                    key={field}
                    className="profile-edit-detail eng-cnt-txt mb-3"
                  >
                    <span>{field.replace(/_/g, " ").toUpperCase()}</span>
                    <Field
                      type={field === "monthly_salary" ? "number" : "date"}
                      name={field}
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="error"
                    />
                  </div>
                ))}
                <div className="profile-edit-inner is-manager-checkbox mb-3">
                  <div className="checkbox-field">
                    <label>
                      <Field type="checkbox" name="is_manager" />
                      <span style={{ marginLeft: "8px" }}>
                        Is Reporting Manager
                      </span>
                    </label>
                    <ErrorMessage
                      name="is_manager"
                      component="div"
                      className="error"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="d-flex justify-content-end mt-3 mx-5">
              <button type="submit" className="theme_btn">
                Save changes
              </button>
            </div>

            {/* Example: */}

            {/* Repeat similarly for email, phone, etc. */}
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default EmployeeProfileEdit;
