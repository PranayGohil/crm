import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { statusOptions } from "../../../options.js";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import ProjectCard from "../../../components/admin/ProjectCard";

const AllProject = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState({
    id: "All Client",
    name: "All Client",
  });
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const statuses = statusOptions;
  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-all`
        );
        setClients(res.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch projects, subtasks & employees
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
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
        const allEmployeeIds = new Set();

        subtaskResults.forEach(({ projectId, subtasks }) => {
          subtasksMap[projectId] = subtasks;
          subtasks.forEach((t) => {
            if (t.assign_to) allEmployeeIds.add(t.assign_to);
          });
        });

        setProjectSubtasks(subtasksMap);

        // Fetch employees by unique IDs
        if (allEmployeeIds.size > 0) {
          const employeeRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/employee/get-multiple`,
            { params: { ids: Array.from(allEmployeeIds).join(",") } }
          );
          const empMap = {};
          employeeRes.data.forEach((e) => {
            empMap[e._id] = e;
          });
          setEmployees(empMap);
        }
      } catch (error) {
        console.error("Error fetching projects/subtasks/employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const clientMatch =
      selectedClient.id === "All Client" ||
      project.client_id === selectedClient._id;
    const statusMatch =
      selectedStatus === "All Status" || project.status === selectedStatus;
    const searchMatch = project.project_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return clientMatch && statusMatch && searchMatch;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate("/")}>
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
          <Link to="/project/add" className="add-button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
            Add Project
          </Link>
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

      {/* Filters and Search */}
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
                  value={selectedClient.id}
                  onChange={(e) => {
                    const client = clients.find(
                      (c) => c._id === e.target.value
                    ) || { id: "All Client", name: "All Client" };
                    setSelectedClient(client);
                  }}
                  className="filter-select"
                >
                  <option value="All Client">All Clients</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
              </div>

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

              <button
                className="reset-button"
                onClick={() => {
                  setSelectedClient({
                    id: "All Client",
                    name: "All Client",
                  });
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
          </div>
        </div>

        <ProjectCard
          filteredProjects={filteredProjects}
          projectSubtasks={projectSubtasks}
          loading={loading}
          employees={employees}
        />
      </section>
    </div>
  );
};

export default AllProject;
