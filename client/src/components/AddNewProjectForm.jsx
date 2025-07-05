import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddNewProjectForm = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // States
  const [projectName, setProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState("Select Client");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [clients, setClients] = useState([]); // fetched clients
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientError, setClientError] = useState(null);

  // 🟢 Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`);
        setClients(res.data);
        setLoadingClients(false);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setClientError("Could not load clients");
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleClientSelect = (clientName) => {
    setSelectedClient(clientName);
    setDropdownOpen(false);
  };

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

  // 🟢 Save project
  const handleSaveProject = async () => {
    try {
      if (
        !projectName ||
        selectedClient === "Select Client" ||
        !startDate ||
        !endDate ||
        !priority
      ) {
        alert("Please fill all required fields!");
        return;
      }

      const payload = {
        project_name: projectName,
        client_name: selectedClient,
        asign_to: [], // add later if needed
        assign_date: startDate,
        due_date: endDate,
        priority: priority,
        status: "To do",
        tasks: [],
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/project/add`, payload);
      alert("Project created successfully!");
      navigate("/allproject");
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Error creating project!");
    }
  };

  return (
    <section className="anp-add_new_project_form">
      <div className="anp-add_project_inner">
        <div className="anp-project_fields">
          <div className="anp-prj_name sms-add_same">
            <span>Project Name</span>
            <input
              type="text"
              placeholder="Enter Project Name"
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
              <span className="text_btn">{selectedClient}</span>
              <img
                src="/SVG/header-vector.svg"
                alt="vec"
                className="arrow_icon"
              />
            </div>
            {dropdownOpen && (
              <ul className="anp-dropdown_menu dropdown_menu" style={{display: "block"}}>
                {loadingClients && <li>Loading...</li>}
                {clientError && <li style={{ color: "red" }}>{clientError}</li>}
                {!loadingClients &&
                  !clientError &&
                  clients.map((client, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleClientSelect(client.full_name)}
                    >
                      {client.full_name}
                    </li>
                  ))}
              </ul>
            )}
            <a href="#" className="anp-add_client_btn">
              <img src="/SVG/plus-vec.svg" alt="plus" /> Add New Client
            </a>
          </div>

          <div className="anp-start_end-date sms-add_same">
            <div className="anp-start_date sms-add_same">
              <span>Start Date - End Date</span>
              <div className="enp-date_input sms-add_same">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="anp-client_priority sms-add_same">
          <span>Priority</span>
          <div className="anp-priority_btn">
            <div
              className={`anp-high_btn pr_btn ${
                priority === "high" ? "active" : ""
              }`}
              onClick={() => setPriority("high")}
            >
              <img src="/SVG/high-vec.svg" alt="p1" /> High
            </div>
            <div
              className={`anp-mid_btn pr_btn ${
                priority === "medium" ? "active" : ""
              }`}
              onClick={() => setPriority("medium")}
            >
              <img src="/SVG/mid-vec.svg" alt="p2" /> Medium
            </div>
            <div
              className={`anp-low_btn pr_btn ${
                priority === "low" ? "active" : ""
              }`}
              onClick={() => setPriority("low")}
            >
              <img src="/SVG/low-vec.svg" alt="p3" /> Low
            </div>
          </div>
        </div>

        <div className="anp-create_btn">
          <button className="anp-create_task-btn" onClick={handleSaveProject}>
            <img src="/SVG/save-vec.svg" alt="Save" /> Save Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default AddNewProjectForm;
