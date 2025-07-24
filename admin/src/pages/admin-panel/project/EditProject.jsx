import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import * as Yup from "yup";

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dropdownRef = useRef();

  // For controlled fields
  const [projectName, setProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const validationSchema = Yup.object().shape({
    project_name: Yup.string().required("Project name is required"),
    client_id: Yup.string().required("Client must be selected"),
    priority: Yup.string().required("Priority is required"),
    assign_date: Yup.date().required("Start date is required"),
    due_date: Yup.date()
      .required("Due date is required")
      .min(Yup.ref("assign_date"), "Due date must be after start date"),
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchProjectAndClients = async () => {
      try {
        const [projectRes, clientsRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`),
        ]);

        const proj = projectRes.data.project; // because your controller sends { success, project }
        setProject(proj);
        setProjectName(proj.project_name);
        setSelectedClient(proj.client_id);
        setPriority(proj.priority);
        setStartDate(proj.assign_date ? proj.assign_date.substr(0, 10) : "");
        setDueDate(proj.due_date ? proj.due_date.substr(0, 10) : "");
        setClients(clientsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjectAndClients();
  }, [projectId]);

  // Dropdown close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleUpdateProject = async () => {
    try {
      // validate inputs first
      await validationSchema.validate(
        {
          project_name: projectName,
          client_id: selectedClient,
          priority,
          assign_date: startDate,
          due_date: dueDate,
        },
        { abortEarly: false }
      );

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/project/update/${projectId}`,
        {
          project_name: projectName,
          client_id: selectedClient,
          priority,
          assign_date: startDate,
          due_date: dueDate,
        }
      );
      toast.success("Project updated successfully!");
      navigate(-1);
    } catch (err) {
      if (err.name === "ValidationError") {
        // Show all validation errors
        err.inner.forEach((e) => toast.error(e.message));
      } else {
        console.error(err);
        toast.error("Update failed!");
      }
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/project/delete/${projectId}`
      );
      toast.success("Project deleted successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed!");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId);
    setDropdownOpen(false);
  };

  if (!project) return <p>Loading...</p>;

  return (
    <>
      <div className="edit_project_page">
        <section className="anp-add_new_project-header">
          <div className="anp-header-inner">
            <div className="anp-heading-main">
              <a onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                <img src="/SVG/arrow-pc.svg" alt="Back" />
              </a>
              <div className="anp-heading-txt">
                <h1>Edit Project</h1>
              </div>
            </div>
            <div className="anp-header-btn">
              <button
                className="anp-delete-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                <img src="/SVG/delete-vec.svg" alt="Delete" /> Delete Project
              </button>
            </div>
          </div>
        </section>

        <section className="anp-add_new_project_form">
          <div className="anp-add_project_inner">
            <div className="anp-project_fields">
              <div className="anp-prj_name sms-add_same">
                <span>Project Name</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>

            <div className="anp-client_pro_date">
              <div className="anp-client-name btn_main" ref={dropdownRef}>
                <span className="anp-client-name-para">Client Name</span>
                <div
                  className="anp-dropdown_toggle dropdown_toggle"
                  onClick={toggleDropdown}
                >
                  <span className="text_btn">
                    {clients.find((c) => c._id === selectedClient)?.full_name ||
                      "Select Client"}
                  </span>
                  <img
                    src="/SVG/header-vector.svg"
                    alt="vec"
                    className="arrow_icon"
                  />
                </div>
                {dropdownOpen && (
                  <ul className="anp-dropdown_menu dropdown_menu">
                    {clients.map((client) => (
                      <li
                        key={client._id}
                        onClick={() => handleClientSelect(client._id)}
                      >
                        {client.full_name}
                      </li>
                    ))}
                  </ul>
                )}
                <a href="/createnewclient" className="anp-add_client_btn">
                  <img src="/SVG/plus-vec.svg" alt="plus" /> Add New Client
                </a>
              </div>

              <div className="anp-start_end-date sms-add_same">
                <span>Start Date - End Date</span>
                <div className="enp-date_input sms-add_same">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="anp-client_priority sms-add_same">
              <span>Priority</span>
              <div className="anp-priority_btn">
                <div
                  className={`anp-high_btn pr_btn ${
                    priority === "High" ? "active" : ""
                  }`}
                  onClick={() => setPriority("High")}
                >
                  <img src="/SVG/high-vec.svg" alt="High" /> High
                </div>
                <div
                  className={`anp-mid_btn pr_btn ${
                    priority === "Medium" ? "active" : ""
                  }`}
                  onClick={() => setPriority("Medium")}
                >
                  <img src="/SVG/mid-vec.svg" alt="Medium" /> Medium
                </div>
                <div
                  className={`anp-low_btn pr_btn ${
                    priority === "Low" ? "active" : ""
                  }`}
                  onClick={() => setPriority("Low")}
                >
                  <img src="/SVG/low-vec.svg" alt="Low" /> Low
                </div>
              </div>
            </div>

            <div className="anp-create_btn">
              <button className="anp-save-btn" onClick={handleUpdateProject}>
                <img src="/SVG/save-vec.svg" alt="Save" /> Update Project
              </button>
            </div>
          </div>
        </section>
      </div>
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Are you sure you want to delete this project?</h3>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleDeleteProject}>
                Yes, Delete
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProject;
