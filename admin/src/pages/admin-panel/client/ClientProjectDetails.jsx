import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../../../components/admin/ProjectCard.jsx";
import { statusOptions, stageOptions } from "../../../options.js";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientProjectDetails = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedStage, setSelectedStage] = useState("All Stages");

  const [dropdownOpen, setDropdownOpen] = useState({
    status: false,
    stage: false,
  });

  const statusDropdownRef = useRef();
  const stageDropdownRef = useRef();

  // Fetch data when username changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get projects of client
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/projects/${username}`
        );
        const fetchedProjects = projectRes.data.projects;
        setProjects(fetchedProjects);

        // 2. Get subtasks for each project
        const subtasksMap = {};
        await Promise.all(
          fetchedProjects.map(async (project) => {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`
            );
            subtasksMap[project._id] = res.data;
          })
        );
        setProjectSubtasks(subtasksMap);

        // 3. Get all employees
        const employeeRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        const empMap = {};
        employeeRes.data.forEach((e) => {
          empMap[e._id] = e;
        });
        setEmployees(empMap);
      } catch (error) {
        console.error("Error loading project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen((prev) => ({ ...prev, status: false }));
      }
      if (
        stageDropdownRef.current &&
        !stageDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen((prev) => ({ ...prev, stage: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter projects by status & stage
  const filteredProjects = projects.filter((proj) => {
    const matchStatus =
      selectedStatus === "All Status" ||
      (proj.status || "").toLowerCase() === selectedStatus.toLowerCase();

    const matchStage =
      selectedStage === "All Stages" ||
      (proj.stage || "").toLowerCase() === selectedStage.toLowerCase();

    return matchStatus && matchStage;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="project_client__client">
      {/* Header */}
      <section className="cd-client_dashboard header">
        <div className="cd-head-menu head-menu cpd_header">
          <div className="anp-back-btn" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img alt="" className="back_arrow mx-3" src="/SVG/arrow-pc.svg" style={{ scale: "1.3" }} />
          </div>
          <h1>Client: {username}</h1>
        </div>
      </section>

      {/* Filter section */}
      <section className="cpd-main_section">
        <div className="cd-filters-inner cpd-filters_inner">
          <div className="cpd-menu-bar">
            {/* Status Dropdown */}
            <div className="btn_main" ref={statusDropdownRef}>
              <div
                className="dropdown_toggle"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, status: !prev.status }))
                }
                style={{ width: "150px" }}
              >
                <span className="text_btn">{selectedStatus}</span>
                <img src="/SVG/arrow.svg" alt="arrow" className="arrow_icon" />
              </div>
              {dropdownOpen.status && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => {
                      setSelectedStatus("All Status");
                      setDropdownOpen((prev) => ({ ...prev, status: false }));
                    }}
                  >
                    All Status
                  </li>
                  {statusOptions.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setSelectedStatus(opt);
                        setDropdownOpen((prev) => ({ ...prev, status: false }));
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stage Dropdown */}
            <div className="btn_main" ref={stageDropdownRef}>
              <div
                className="dropdown_toggle"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, stage: !prev.stage }))
                }
                style={{ width: "200px" }}
              >
                <span className="text_btn">{selectedStage}</span>
                <img src="/SVG/arrow.svg" alt="arrow" className="arrow_icon" />
              </div>
              {dropdownOpen.stage && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => {
                      setSelectedStage("All Stages");
                      setDropdownOpen((prev) => ({ ...prev, stage: false }));
                    }}
                  >
                    All Stages
                  </li>
                  {stageOptions.map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setSelectedStage(opt);
                        setDropdownOpen((prev) => ({ ...prev, stage: false }));
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Reset Filters */}
          <div
            className="filter cpd_filter_header"
            onClick={() => {
              setSelectedStatus("All Status");
              setSelectedStage("All Stages");
            }}
          >
            <img src="/SVG/filter-vector.svg" alt="filter" />
            <span>Reset Filters</span>
          </div>
        </div>
      </section>

      {/* Project cards */}
      <ProjectCard
        filteredProjects={filteredProjects}
        projectSubtasks={projectSubtasks}
        employees={employees}
        loading={loading}
      />
    </div>
  );
};

export default ClientProjectDetails;
