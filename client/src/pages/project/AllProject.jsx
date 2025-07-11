import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverlay";
import ProjectCard from "../../components/ProjectCard";

const AllProject = () => {
  const [selectedClient, setSelectedClient] = useState("All Client");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState({
    client: false,
    status: false,
  });

  const [clients, setClients] = useState([]);
  const statuses = ["To do", "In progress", "In Review", "Block", "Done"];
  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});

  const [loading, setLoading] = useState(true);
  const clientDropdownRef = useRef();
  const statusDropdownRef = useRef();

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-all`
        );
        setClients(res.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch projects & subtasks
  useEffect(() => {
    const fetchProjectsAndSubtasks = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get-all`
        );
        setProjects(res.data);

        const subtaskPromises = res.data.map(async (project) => {
          const subtasksRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`
          );
          return { projectId: project._id, subtasks: subtasksRes.data };
        });

        const subtaskResults = await Promise.all(subtaskPromises);
        const subtasksMap = {};
        subtaskResults.forEach(({ projectId, subtasks }) => {
          subtasksMap[projectId] = subtasks;
        });
        setProjectSubtasks(subtasksMap);
      } catch (error) {
        console.error("Error fetching projects/subtasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsAndSubtasks();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen((prev) => ({ ...prev, client: false }));
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen((prev) => ({ ...prev, status: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const clientMatch =
      selectedClient === "All Client" || project.client_name === selectedClient;
    const statusMatch =
      selectedStatus === "All Status" || project.status === selectedStatus;
    const searchMatch = project.project_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return clientMatch && statusMatch && searchMatch;
  });

  return (
    <div className="all-project-page">
      <LoadingOverlay show={loading} />

      <section className="header">
        <div className="head-menu">
          <h1>All Projects</h1>
          <div className="menu-bar">
            <div className="btn_main" ref={clientDropdownRef}>
              <div
                className="dropdown_toggle header-dropdown-width"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, client: !prev.client }))
                }
              >
                <span className="text_btn">{selectedClient}</span>
                <img src="/SVG/arrow.svg" alt="arrow" className="arrow_icon" />
              </div>
              {dropdownOpen.client && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => {
                      setSelectedClient("All Client");
                      setDropdownOpen((prev) => ({ ...prev, client: false }));
                    }}
                  >
                    All Client
                  </li>
                  {clients.map((client, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedClient(client.full_name);
                        setDropdownOpen((prev) => ({ ...prev, client: false }));
                      }}
                    >
                      {client.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="btn_main" ref={statusDropdownRef}>
              <div
                className="dropdown_toggle"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, status: !prev.status }))
                }
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
                  {statuses.map((status, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedStatus(status);
                        setDropdownOpen((prev) => ({ ...prev, status: false }));
                      }}
                    >
                      {status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="nav-bar">
          <div className="nav-search justify_end">
            <div className="searchbar">
              <div className="input-type">
                <div className="img-search-input">
                  <img src="/SVG/search-icon.svg" alt="search" />
                </div>
                <div className="input-type-txt">
                  <input
                    type="text"
                    placeholder="Search by project name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </div>
            <div className="add-mbr">
              <Link to="/project/add" className="plus-icon">
                <img src="/SVG/plues.svg" alt="add" />
                <span>Add Project</span>
              </Link>
            </div>
          </div>
          <div
            className="filter"
            onClick={() => {
              setSelectedClient("All Client");
              setSelectedStatus("All Status");
              setSearchTerm("");
            }}
          >
            <img src="/SVG/filter.svg" alt="filter" />
            <span>Reset Filters</span>
          </div>
        </div>
      </section>

      <ProjectCard
        filteredProjects={filteredProjects}
        projectSubtasks={projectSubtasks}
        loading={loading}
      />
    </div>
  );
};

export default AllProject;
