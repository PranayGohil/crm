import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { stageOptions, priorityOptions } from "../options";

const SubtaskDashboardContainer = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    assignTo: "",
    priority: "",
    stage: "",
  });

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
      );
      const projectRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
      );
      setProject(projectRes.data.project);
      setSubtasks(res.data);
    } catch (error) {
      console.error("Failed to fetch subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/get-all`
      );
      setEmployees(res.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
    fetchEmployees();
  }, [projectId]);

  const filteredSubtasks = subtasks.filter(
    (task) =>
      (!filters.assignTo || String(task.assign_to) === filters.assignTo) &&
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.stage || task.stage === filters.stage)
  );

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;

  return (
    <>
      {/* Header */}
      <section className="sv-sec1 header">
        <div className="sv-sec1-inner">
          <div className="d-flex">
            <Link to="/dashboard" className="back_arrow_link mx-3">
              <img src="/SVG/arrow-pc.svg" alt="Back" className="back_arrow" />
            </Link>
            <h3>Subtask View</h3>
          </div>
          <p>{project?.project_name}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sv-sec3 cpd-filters_section">
        <div className="cpd-menu-bar">
          <select
            value={filters.assignTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, assignTo: e.target.value }))
            }
            className="dropdown_toggle"
          >
            <option value="">Filter by Assign To</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.full_name}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            className="dropdown_toggle"
          >
            <option value="">Filter by Priority</option>
            {priorityOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={filters.stage}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, stage: e.target.value }))
            }
            className="dropdown_toggle"
          >
            <option value="">Filter by Stage</option>
            {stageOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <span
            className="css-filter"
            onClick={() =>
              setFilters({ assignTo: "", priority: "", stage: "" })
            }
          >
            <img src="/SVG/filter-vector.svg" alt="filter icon" /> Reset Filters
          </span>
        </div>
      </section>

      {/* Table */}
      <section className="sv-sec-table p-5">
        <table className="subtask-table border">
          <thead>
            <tr>
              <th>Subtask Name</th>
              <th>Assign Date</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubtasks.map((task) => (
              <tr key={task._id}>
                <td>{task.task_name}</td>
                <td>{formateDate(task.assign_date)}</td>
                <td>{formateDate(task.due_date)}</td>
                <td>{task.priority}</td>
                <td>{task.stage}</td>
                <td>{task.status}</td>
                <td className="d-flex justify-content-start align-items-center">
                  {(() => {
                    const assignedEmp = employees.find(
                      (emp) => emp._id === task.assign_to
                    );
                    if (!assignedEmp) return "N/A";

                    const firstLetter = assignedEmp.full_name
                      ? assignedEmp.full_name.charAt(0).toUpperCase()
                      : "?";

                    return (
                      <span className="css-ankit d-flex align-items-center">
                        {assignedEmp.profile_pic ? (
                          <img
                            src={assignedEmp.profile_pic}
                            alt={assignedEmp.full_name}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              marginRight: "4px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "rgb(10 55 73)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              marginRight: "4px",
                              textTransform: "uppercase",
                            }}
                          >
                            {firstLetter}
                          </div>
                        )}
                        {assignedEmp.full_name}
                      </span>
                    );
                  })()}
                </td>

                <td>
                  <Link to={`/subtask/view/${task._id}`} className="mx-1">
                    <img src="/SVG/eye-view.svg" alt="view" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default SubtaskDashboardContainer;
