import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProjectCard from "../components/ProjectCard.jsx";
import { statusOptions, stageOptions } from "../options.js";

const ClientAdminProjectDetails = () => {
  const [status, setStatus] = useState("All Status");
  const [stage, setStage] = useState("All Stages");
  const [dropdownOpen, setDropdownOpen] = useState({
    status: false,
    stage: false,
  });

  const statusRef = useRef(null);
  const stageRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("")

  // 📦 Fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem("clientUser");
    const clientUser = storedUser ? JSON.parse(storedUser) : null;
    setFullName(clientUser?.full_name);
    const token = clientUser?.token;
    const fetchData = async () => {
      try {
        setLoading(true);
        const username = localStorage.getItem("clientUsername");
        console.log("username:", username);

        // 1️⃣ Projects
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/projects/${username}`
        );
        const fetchedProjects = projectRes.data.projects;
        setProjects(fetchedProjects);

        // 2️⃣ Subtasks
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

        // 3️⃣ Employees
        const employeeRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        const empMap = {};
        employeeRes.data.forEach((e) => {
          empMap[e._id] = e;
        });
        setEmployees(empMap);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🪄 Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setDropdownOpen((prev) => ({ ...prev, status: false }));
      }
      if (stageRef.current && !stageRef.current.contains(e.target)) {
        setDropdownOpen((prev) => ({ ...prev, stage: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (type) => {
    setDropdownOpen((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // 🧩 Filter projects
  const filteredProjects = projects.filter((proj) => {
    const matchStatus =
      status === "All Status" ||
      (proj.status || "").toLowerCase() === status.toLowerCase();
    const matchStage =
      stage === "All Stages" ||
      (proj.stage || "").toLowerCase() === stage.toLowerCase();
    return matchStatus && matchStage;
  });

  // Summary cards
  const summaryData = [
    { icon: "/SVG/cpd-join.svg", label: "Joined", value: "12 March 2024" },
    {
      icon: "/SVG/cpd-total.svg",
      label: "Total Projects",
      value: projects.length,
    },
    {
      icon: "/SVG/cpd-complete.svg",
      label: "Completed",
      value: projects.filter((p) => p.status === "Done").length,
    },
    {
      icon: "/SVG/cpd-process.svg",
      label: "In Progress",
      value: projects.filter((p) => p.status === "In Progress").length,
    },
  ];

  return (
    <div className="project_client__client-main mb_40">
      <section className="cd-client_dashboard header">
        <div className="cd-head-menu head-menu cpd_header">
          <h1>Client: {fullName}</h1>
        </div>
        <div className="cd-nav-bar nav-bar">
          <div className="cd-nav-search nav-search">
            <div className="cd-searchbar searchbar">
              <div className="cd-input-type input-type">
                <div className="cd-img-search-input img-search-input">
                  <img src="/SVG/search-icon.svg" alt="search" />
                </div>
                <div className="cd-input-type-txt input-type-txt">
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="cpd-main_section">
        <div className="cpd-main_inner">
          {summaryData.map((item, index) => (
            <div key={index} className={`cpd-head-inner inf-sec-${index + 1}`}>
              <img src={item.icon} alt={item.label} />
              <div className="cpd-name name1">
                <p>{item.label}</p>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="cd-filters-inner cpd-filters_inner">
          <div className="cpd-menu-bar">
            {/* Status Dropdown */}
            <div
              className={`btn_main ${dropdownOpen.status ? "open" : ""}`}
              ref={statusRef}
              style={{ width: "150px" }}
            >
              <div
                className="dropdown_toggle"
                onClick={() => toggleDropdown("status")}
              >
                <span className="text_btn">{status}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="arrow"
                  className="arrow_icon"
                />
              </div>
              {dropdownOpen.status && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => {
                      setStatus("All Status");
                      setDropdownOpen((prev) => ({ ...prev, status: false }));
                    }}
                  >
                    All Status
                  </li>
                  {statusOptions.map((option, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setStatus(option);
                        setDropdownOpen((prev) => ({ ...prev, status: false }));
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Stage Dropdown */}
            <div
              className={`btn_main ${dropdownOpen.stage ? "open" : ""}`}
              ref={stageRef}
              style={{ width: "200px" }}
            >
              <div
                className="dropdown_toggle"
                onClick={() => toggleDropdown("stage")}
              >
                <span className="text_btn">{stage}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="arrow"
                  className="arrow_icon"
                />
              </div>
              {dropdownOpen.stage && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => {
                      setStage("All Stages");
                      setDropdownOpen((prev) => ({ ...prev, stage: false }));
                    }}
                  >
                    All Stages
                  </li>
                  {stageOptions.map((option, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setStage(option);
                        setDropdownOpen((prev) => ({ ...prev, stage: false }));
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div
            className="filter cpd_filter_header"
            onClick={() => {
              setStatus("All Status");
              setStage("All Stages");
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

export default ClientAdminProjectDetails;
