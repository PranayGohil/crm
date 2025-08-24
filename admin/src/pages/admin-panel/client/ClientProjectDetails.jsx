import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../../../components/admin/ProjectCard.jsx";
import { statusOptions } from "../../../options.js";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientProjectDetails = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);

  const statuses = statusOptions;
  const [searchTerm, setSearchTerm] = useState("");
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
  const filteredProjects = projects.filter((project) => {
    const statusMatch =
      selectedStatus === "All Status" || project.status === selectedStatus;
    const searchMatch = project.project_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">All Projects</h1>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{filteredProjects.length}</span>
          <span>of {projects.length} Projects</span>
        </div>
        <div className="stats-info">
          <span className="stats-number">{Object.keys(employees).length}</span>
          <span>Active Employees</span>
        </div>
      </section>

      {/* Filter section */}
      <section className="table-container">
        <div className="table-controls">
          <div className="controls-left flex justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search by project name..."
              className="search-input"
            />

            <div className="flex gap-3">
              <div className="filter-group">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Status">All Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            className="reset-button"
            onClick={() => {
              setSelectedStatus("All Status");
              setSearchTerm("");
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Reset Filters
          </button>
        </div>
        
        <ProjectCard
          filteredProjects={filteredProjects}
          projectSubtasks={projectSubtasks}
          employees={employees}
          loading={loading}
        />
      </section>
    </div>
  );
};

export default ClientProjectDetails;
