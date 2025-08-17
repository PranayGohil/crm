import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { stageOptions, priorityOptions, statusOptions } from "../options";
import LoadingOverlay from "../components/LoadingOverlay";

dayjs.extend(duration);

const Subtasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("employeeUser"));
  const [projects, setProjects] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(null);

  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState({
    client: "All Client",
    status: "Status",
    priority: "Priority",
    stage: "Stage",
    employee: "Employee",
  });

  const headerRef = useRef(null);

  const dropdownData = {
    status: statusOptions,
    priority: priorityOptions,
    stage: stageOptions,
  };
  dropdownData.employee = ["Employee", ...employees.map((e) => e.full_name)];

  const fetchAll = async () => {
    try {
      const [projectsRes, clientsRes, employeesRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/manager/${user._id}`
        ),
        axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
      ]);

      const myEmployees = employeesRes.data.filter(
        (emp) => emp.reporting_manager === user._id
      );

      setProjects(projectsRes.data);
      setClients(clientsRes.data);
      setEmployees(myEmployees);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/summary`)
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setHeaderDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHeaderToggle = (key) => {
    setHeaderDropdownOpen(headerDropdownOpen === key ? null : key);
  };

  const handleFilterSelect = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setHeaderDropdownOpen(null);
  };

  const handleResetFilters = () => {
    setFilters({
      client: "All Client",
      status: "Status",
      priority: "Priority",
      stage: "Stage",
      employee: "Employee",
    });
  };

  const clientIdToName = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c._id] = c.full_name;
    });
    return map;
  }, [clients]);

  const filteredProjects = projects.filter((p) => {
    const clientName = clientIdToName[p.client_id];

    const matchClient =
      filters.client === "All Client" ||
      clientName?.toLowerCase() === filters.client.toLowerCase();

    const matchStatus =
      filters.status === "Status" ||
      p.subtasks?.some(
        (s) => s.status?.toLowerCase() === filters.status.toLowerCase()
      );

    const matchPriority =
      filters.priority === "Priority" ||
      p.priority?.toLowerCase() === filters.priority.toLowerCase();

    const matchStage =
      filters.stage === "Stage" ||
      p.subtasks?.some((s) => {
        console.log(s.stage[s.current_stage_index || 0], filters.stage);
        return (
          s.stage[s.current_stage_index || 0].toLowerCase() ===
          filters.stage.toLowerCase()
        );
      });

    const matchEmployee =
      filters.employee === "Employee" ||
      p.subtasks?.some((s) => {
        const assignedEmp = employees.find((e) => e._id === s.assign_to);
        return assignedEmp?.full_name === filters.employee;
      });

    const matchSearch =
      p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchClient &&
      matchStatus &&
      matchPriority &&
      matchStage &&
      matchEmployee &&
      matchSearch
    );
  });

  // ✅ helper to compute remaining days
  const getRemainingDays = (dueDate) => {
    if (!dueDate) return "-";
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} days` : "Overdue";
  };

  const calculateProjectTotalTime = (subtasks = []) => {
    let totalMs = 0;
    subtasks.forEach((s) => {
      s.time_logs?.forEach((log) => {
        const start = dayjs(log.start_time);
        const end = log.end_time ? dayjs(log.end_time) : dayjs();
        totalMs += end.diff(start);
      });
    });

    const dur = dayjs.duration(totalMs);
    return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
  };

  const calculateTimeTracked = (timeLogs = []) => {
    console.log("Calculating time tracked for logs:", timeLogs);
    let totalMs = 0;
    timeLogs.forEach((log) => {
      const start = dayjs(log.start_time);
      const end = log.end_time ? dayjs(log.end_time) : dayjs();
      totalMs += end.diff(start);
    });

    const dur = dayjs.duration(totalMs);
    return `${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  if (loading) return <LoadingOverlay />;
  return (
    <section className="task_timeboard_wrapper">
      <section className="header ttb-header">
        <div className="d-flex align-items-top ps-3 pt-4">
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
              className="mx-3"
              style={{ scale: "1.3" }}
            />
          </div>
          <div className="head-menu">
            <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
              All Subtasks{" "}
            </h1>
          </div>
        </div>
      </section>

      <section className="ttb-search-btn-bar-main">
        <div className="ttb-search-btn-bar-main-inner d-flex justify-content-between">
          <div className="input-type ttb-search-bar">
            <div className="img-search-input">
              <img src="/SVG/search-icon.svg" alt="search" />
            </div>
            <div className="input-type-txt">
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: "none" }}
              />
            </div>
          </div>

          <div className="ttb-all-btn-main" ref={headerRef}>
            {["status", "stage", "employee"].map((key) => (
              <div
                key={key}
                className={`btn_main ttb-btn ${
                  headerDropdownOpen === key ? "open" : ""
                }`}
                style={{ marginLeft: "10px", width: "150px" }}
              >
                <div
                  className="dropdown_toggle"
                  onClick={() => handleHeaderToggle(key)}
                >
                  <span className="text_btn">{filters[key]}</span>
                  <img src="/SVG/arrow.svg" alt="arrow" />
                </div>
                {headerDropdownOpen === key && (
                  <ul className="dropdown_menu">
                    {dropdownData[key].map((item, i) => (
                      <li key={i} onClick={() => handleFilterSelect(key, item)}>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="filter ttb-filter" onClick={handleResetFilters}>
              <img src="/SVG/filter-white.svg" alt="reset" />
              <span>Reset Filters</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ttb-table-main">
        <div className="time-table-wrapper">
          <table className="time-table-table">
            <thead>
              <tr>
                <th></th>
                <th>Project Name</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Total Time</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Remaining Time</th> {/* ✅ added */}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, idx) => (
                <React.Fragment key={project._id}>
                  <tr>
                    <td>
                      <img
                        src="/SVG/arrow.svg"
                        alt="toggle"
                        className={`time-table-toggle-btn ${
                          openRow === idx ? "rotate-down" : ""
                        }`}
                        onClick={() => setOpenRow(openRow === idx ? null : idx)}
                      />
                    </td>
                    {/* <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={() => toggleSelect(project.id)}
                      />
                    </td> */}
                    <td>{project.project_name}</td>
                    <td>
                      <span
                        className={`time-table-badge md-status-${(
                          project.status || ""
                        )
                          .toLowerCase()
                          .replace(" ", "")}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    {(() => {
                      // Apply subtask-level filters (same logic you use inside expanded row)
                      const filteredSubtasks =
                        project.subtasks?.filter((s) => {
                          const stageMatch =
                            filters.stage === "Stage" ||
                            s.stage[s.current_stage_index]?.toLowerCase() ===
                              filters.stage.toLowerCase();

                          const statusMatch =
                            filters.status === "Status" ||
                            s.status?.toLowerCase() ===
                              filters.status.toLowerCase();

                          const employeeMatch =
                            filters.employee === "Employee" ||
                            employees.find((e) => e._id === s.assign_to)
                              ?.full_name === filters.employee;

                          return stageMatch && statusMatch && employeeMatch;
                        }) || [];

                      return (
                        <>
                          {/* ✅ Subtask count according to filters */}
                          <td>{filteredSubtasks.length}</td>

                          {/* ✅ Total time according to filtered subtasks */}
                          <td>{calculateProjectTotalTime(filteredSubtasks)}</td>
                        </>
                      );
                    })()}
                    <td>
                      {project.assign_date
                        ? new Date(project.assign_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td>
                      {project.due_date
                        ? new Date(project.due_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td>{getRemainingDays(project.due_date)}</td>{" "}
                  </tr>
                  {openRow === idx && (
                    <tr className="time-table-subtask-row">
                      <td></td>
                      <td colSpan="11">
                        <table className="time-table-subtable">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Subtask Name</th>
                              <th>Stage</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>URL</th>
                              <th>Assigned To</th>
                              <th>Time Tracked</th>
                              <th>Remaining Time</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.subtasks
                              ?.filter((s) => {
                                const stageMatch =
                                  filters.stage === "Stage" ||
                                  s.stage[
                                    s.current_stage_index
                                  ]?.toLowerCase() ===
                                    filters.stage.toLowerCase();

                                const statusMatch =
                                  filters.status === "Status" ||
                                  s.status?.toLowerCase() ===
                                    filters.status.toLowerCase();

                                const employeeMatch =
                                  filters.employee === "Employee" ||
                                  employees.find((e) => e._id === s.assign_to)
                                    ?.full_name === filters.employee;

                                return (
                                  stageMatch && statusMatch && employeeMatch
                                );
                              })

                              .map((s, sIdx) => (
                                <tr key={s.id}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedTaskIds.includes(s.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedTaskIds([
                                            ...selectedTaskIds,
                                            s.id,
                                          ]);
                                        } else {
                                          setSelectedTaskIds(
                                            selectedTaskIds.filter(
                                              (id) => id !== s.id
                                            )
                                          );
                                        }
                                        console.log({ selectedTaskIds });
                                      }}
                                    />
                                  </td>
                                  <td>{s.task_name}</td>
                                  <td>
                                    {s.stage &&
                                    s.current_stage_index !== undefined
                                      ? s.stage[s.current_stage_index] || "N/A"
                                      : "N/A"}
                                  </td>
                                  <td>
                                    <span
                                      className={`time-table-badge md-status-${(
                                        s.priority || ""
                                      )
                                        .toLowerCase()
                                        .replace(" ", "")}`}
                                    >
                                      {s.priority}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`time-table-badge md-status-${(
                                        s.status || ""
                                      )
                                        .toLowerCase()
                                        .replace(" ", "")}`}
                                    >
                                      {s.status}
                                    </span>
                                  </td>
                                  <td
                                    style={{
                                      width: "200px",
                                      position: "relative",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "200px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        cursor: "pointer",
                                        color: "#007bff",
                                        paddingRight: "20px", // To give space for the icon
                                        position: "relative",
                                      }}
                                      onClick={(e) =>
                                        handleCopyToClipboard(s.url, e)
                                      }
                                      title="Click to copy. Ctrl+Click to open."
                                    >
                                      <span
                                        style={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {s.url}
                                      </span>

                                      <span
                                        onClick={(e) =>
                                          handleCopyToClipboard(s.url, e)
                                        }
                                        style={{
                                          position: "absolute",
                                          right: "2px",
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          fontSize: "14px",
                                          color: "#555",
                                          cursor: "pointer",
                                        }}
                                        title="Copy URL"
                                      >
                                        <img
                                          src="/SVG/clipboard.svg"
                                          alt="copy icon"
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            filter: "hue-rotate(310deg)",
                                            opacity: 0.8,
                                          }}
                                        />
                                      </span>
                                    </div>
                                  </td>
                                  <td className="d-flex justify-content-center align-items-center">
                                    {(() => {
                                      const assignedEmp = employees.find(
                                        (emp) => emp._id === s.assign_to
                                      );
                                      if (!assignedEmp) return "Not Assigned";
                                      const firstLetter = assignedEmp.full_name
                                        ? assignedEmp.full_name
                                            .charAt(0)
                                            .toUpperCase()
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
                                                backgroundColor:
                                                  "rgb(10 55 73)",
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
                                  <td>{calculateTimeTracked(s.time_logs)}</td>{" "}
                                  <td>{getRemainingDays(s.due_date)}</td>
                                  <td>
                                    <Link
                                      to={`/subtask/view/${s.id}`}
                                      className="mx-1"
                                    >
                                      <img src="/SVG/eye-view.svg" alt="view" />
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default Subtasks;
