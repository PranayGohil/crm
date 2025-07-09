import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import LoadingOverlay from "../../components/LoadingOverlay";

const AddNewProject = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientError, setClientError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🟢 Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-all`
        );
        setClients(res.data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setClientError("Could not load clients");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formik = useFormik({
    initialValues: {
      project_name: "",
      client_id: "",
      client_name: "",
      assign_date: "",
      due_date: "",
      priority: "",
    },

    validationSchema: Yup.object({
      project_name: Yup.string().required("Project name is required"),
      client_id: Yup.string().required("Client is required"),
      assign_date: Yup.date().required("Start date is required"),
      due_date: Yup.date()
        .required("End date is required")
        .min(Yup.ref("assign_date"), "End date cannot be before start date"),
      priority: Yup.string().required("Priority is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          project_name: values.project_name,
          client_id: values.client_id,
          asign_to: [],
          assign_date: values.assign_date,
          due_date: values.due_date,
          priority: values.priority,
          status: "To do",
          tasks: [],
        };

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/project/add`,
          payload
        );
        toast.success("Project created successfully!");
        resetForm();
        navigate("/project/dashboard");
      } catch (error) {
        console.error("Failed to create project:", error);
        toast.error("Error creating project!");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    handleChange,
    handleSubmit,
    setFieldValue,
    values,
    errors,
    touched,
    isSubmitting,
  } = formik;

  return (
    <div className="add_new_project_page">
      <LoadingOverlay show={isSubmitting} />

      <section className="anp-add_new_project-header">
        <div className="anp-header-inner">
          <div className="anp-heading-main">
            <Link
              to="/project/dashboard"
              className="anp-back-btn"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              <img src="/SVG/arrow-pc.svg" alt="back" />
            </Link>
            <div className="head-menu">
              <h1>Add New Project</h1>
            </div>
          </div>
          <div className="anp-header-btn">
            <button
              type="submit"
              className="anp-save-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <img src="/SVG/save-vec.svg" alt="save" /> Save Project
            </button>
          </div>
        </div>
      </section>

      <section className="anp-add_new_project_form">
        <form onSubmit={handleSubmit}>
          <div className="anp-add_project_inner">
            {/* Project name */}
            <div className="anp-prj_name sms-add_same">
              <span>Project Name</span>
              <input
                type="text"
                name="project_name"
                value={values.project_name}
                onChange={handleChange}
                placeholder="Enter Project Name"
                disabled={isSubmitting}
              />
              {touched.project_name && errors.project_name && (
                <div className="error">{errors.project_name}</div>
              )}
            </div>
            <div className="d-flex flex-col gap-4">
              {/* Client name dropdown */}
              <div className="anp-client-name btn_main" ref={dropdownRef}>
                <span className="anp-client-name-para">Client Name</span>
                <div
                  className="anp-dropdown_toggle dropdown_toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="text_btn">
                    {values.client_name || "Select Client"}
                  </span>
                  <img
                    src="/SVG/header-vector.svg"
                    alt="arrow"
                    className="arrow_icon"
                  />
                </div>
                {dropdownOpen && (
                  <ul className="anp-dropdown_menu">
                    {loadingClients && <li>Loading...</li>}
                    {clientError && (
                      <li style={{ color: "red" }}>{clientError}</li>
                    )}
                    {!loadingClients &&
                      !clientError &&
                      clients.map((client) => (
                        <li
                          key={client._id}
                          onClick={() => {
                            setFieldValue("client_name", client.full_name);
                            setFieldValue("client_id", client._id);
                            setDropdownOpen(false);
                          }}
                        >
                          {client.full_name}
                        </li>
                      ))}
                  </ul>
                )}
                {touched.client_name && errors.client_name && (
                  <div className="error">{errors.client_name}</div>
                )}
                <a href="/client/create" className="anp-add_client_btn">
                  <img src="/SVG/plus-vec.svg" alt="plus" /> Add New Client
                </a>
              </div>

              {/* Start & end date */}
              <div className="anp-start_end-date sms-add_same">
                <span className="anp-client-name-para">
                  Start Date - End Date
                </span>
                <div className="enp-date_input sms-add_same">
                  <input
                    type="date"
                    name="assign_date"
                    value={values.assign_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <input
                    type="date"
                    name="due_date"
                    value={values.due_date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="error-group">
                  {touched.assign_date && errors.assign_date && (
                    <div className="error">{errors.assign_date}</div>
                  )}
                  {touched.due_date && errors.due_date && (
                    <div className="error">{errors.due_date}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="anp-client_priority sms-add_same">
              <span>Priority</span>
              <div className="anp-priority_btn">
                <div
                  className={`anp-high_btn pr_btn ${
                    values.priority === "high" ? "active" : ""
                  }`}
                  onClick={() => setFieldValue("priority", "high")}
                >
                  <img src="/SVG/high-vec.svg" alt="High" /> High
                </div>
                <div
                  className={`anp-mid_btn pr_btn ${
                    values.priority === "medium" ? "active" : ""
                  }`}
                  onClick={() => setFieldValue("priority", "medium")}
                >
                  <img src="/SVG/mid-vec.svg" alt="Medium" /> Medium
                </div>
                <div
                  className={`anp-low_btn pr_btn ${
                    values.priority === "low" ? "active" : ""
                  }`}
                  onClick={() => setFieldValue("priority", "low")}
                >
                  <img src="/SVG/low-vec.svg" alt="Low" /> Low
                </div>
              </div>
              {touched.priority && errors.priority && (
                <div className="error">{errors.priority}</div>
              )}
            </div>

            {/* Save button */}
            <div className="anp-create_btn">
              <button
                type="submit"
                className="anp-create_task-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    <img src="/SVG/save-vec.svg" alt="save" /> Save Project
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddNewProject;
