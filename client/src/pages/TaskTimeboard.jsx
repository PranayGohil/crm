import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const TaskTimeboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [openRow, setOpenRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(null);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [filters, setFilters] = useState({
    client: "All Client",
    status: "Status",
    priority: "Priority",
  });

  const [selections, setSelections] = useState({
    priority: "Set Priority",
    status: "Change Status",
  });

  const headerRef = useRef(null);
  const bulkRef = useRef(null);

  const dropdownData = {
    status: ["To do", "In progress", "Pause", "Blocked", "Done"],
    priority: ["High", "Medium", "Low"],
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectsRes, clientsRes, employeesRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/project/all-tasks-projects`
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
        ]);
        console.log("Projects:", projectsRes.data);
        setProjects(projectsRes.data);
        setClients(clientsRes.data);
        setEmployees(employeesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    setSelectedCount(selectedIds.length);
  }, [selectedIds]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setHeaderDropdownOpen(null);
      }
      if (bulkRef.current && !bulkRef.current.contains(e.target)) {
        setBulkDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHeaderToggle = (key) => {
    setHeaderDropdownOpen(headerDropdownOpen === key ? null : key);
  };

  const handleBulkToggle = (key) => {
    setBulkDropdownOpen(bulkDropdownOpen === key ? null : key);
  };

  const handleFilterSelect = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setHeaderDropdownOpen(null);
  };

  const handleBulkSelect = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    setBulkDropdownOpen(null);
  };

  const handleResetFilters = () => {
    setFilters({
      client: "All Client",
      status: "Status",
      priority: "Priority",
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdateBoth = async () => {
    try {
      if (selections.priority !== "Set Priority") {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/project/bulk-update`,
          {
            ids: selectedIds,
            field: "priority",
            value: selections.priority,
          }
        );
        setProjects((prev) =>
          prev.map((p) =>
            selectedIds.includes(p._id)
              ? { ...p, priority: selections.priority }
              : p
          )
        );
        setSelections((prev) => ({ ...prev, priority: "Set Priority" }));
      }
      if (selections.status !== "Change Status") {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/project/bulk-update`,
          {
            ids: selectedIds,
            field: "status",
            value: selections.status,
          }
        );
        setProjects((prev) =>
          prev.map((p) =>
            selectedIds.includes(p._id)
              ? { ...p, status: selections.status }
              : p
          )
        );
        setSelections((prev) => ({ ...prev, status: "Change Status" }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Bulk delete
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/project/bulk-delete`,
        {
          data: { ids: selectedIds },
        }
      );
      setProjects((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
    }
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
    const matchFilter =
      (filters.client === "All Client" ||
        clientName?.toLowerCase() === filters.client?.toLowerCase()) &&
      (filters.status === "Status" ||
        p.status?.toLowerCase() === filters.status?.toLowerCase()) &&
      (filters.priority === "Priority" ||
        p.priority?.toLowerCase() === filters.priority?.toLowerCase());
    const matchSearch =
      p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <section className="task_timeboard_wrapper">
      <section className="header ttb-header">
        <div className="head-menu ttb-header-menu">
          <h1>Task Time board</h1>
          <p>Manage your jewelry production workflow</p>
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
            {/* Client Dropdown */}
            <div
              className={`btn_main ttb-btn ${
                headerDropdownOpen === "client" ? "open" : ""
              }`}
            >
              <div
                className="dropdown_toggle"
                onClick={() => handleHeaderToggle("client")}
              >
                <span className="text_btn">{filters.client}</span>
                <img src="/SVG/arrow.svg" alt="arrow" />
              </div>
              {headerDropdownOpen === "client" && (
                <ul className="dropdown_menu">
                  <li
                    onClick={() => handleFilterSelect("client", "All Client")}
                  >
                    All Client
                  </li>
                  {clients.map((c) => (
                    <li
                      key={c._id}
                      onClick={() => handleFilterSelect("client", c.full_name)}
                    >
                      {c.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Other Dropdowns */}
            {["status", "priority"].map((key) => (
              <div
                key={key}
                className={`btn_main ttb-btn ${
                  headerDropdownOpen === key ? "open" : ""
                }`}
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
                <th>
                  {" "}
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredProjects.length &&
                      filteredProjects.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredProjects.map((p) => p._id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Subtasks</th>
                <th>Total Time</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(project.id)}
                        onChange={() => toggleSelect(project.id)}
                      />
                    </td>
                    <td>{project.project_name}</td>
                    <td>{clientIdToName[project.client_id] || "N/A"}</td>
                    <td>
                      <span className="time-table-badge">{project.status}</span>
                    </td>
                    <td>{project.subtasks?.length}</td>
                    <td>{project.totalTime || "-"}</td>
                    <td>
                      <span className="time-table-badge">
                        {project.priority}
                      </span>
                    </td>
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
                    <td className="time-table-icons">
                      <Link to={`/project/edit/${project.id}`}>
                        <img src="/SVG/edit.svg" alt="edit" />
                      </Link>
                      {/* <a href="#">
                        <img src="/SVG/delete.svg" alt="delete" />
                      </a> */}
                      <a href="PreviewButton">
                        <img src="/SVG/eye-view.svg" alt="view" />
                      </a>
                    </td>
                  </tr>
                  {openRow === idx && (
                    <tr className="time-table-subtask-row">
                      <td></td>
                      <td colSpan="10">
                        <table className="time-table-subtable">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Subtask Name</th>
                              <th>Stage</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Assigned To</th>
                              <th>Time Tracked</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.subtasks?.map((s, sIdx) => (
                              <tr key={sIdx}>
                                <td></td>
                                <td>{s.task_name}</td>
                                <td>{s.stage}</td>
                                <td>{s.priority}</td>
                                <td>{s.status}</td>
                                <td className="d-flex justify-content-start">
                                  {s.asign_to && s.asign_to.length > 0
                                    ? (() => {
                                        const assignedEmp = employees.find(
                                          (emp) => emp._id === s.asign_to[0].id
                                        );
                                        return assignedEmp ? (
                                          <span className="css-ankit">
                                            <img
                                              src={
                                                assignedEmp.profile_pic ||
                                                "/Image/default.png"
                                              }
                                              alt={assignedEmp.full_name}
                                              style={{
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "50%",
                                                marginRight: "4px",
                                              }}
                                            />
                                            {assignedEmp.full_name}
                                          </span>
                                        ) : (
                                          s.asign_to[0].id
                                        );
                                      })()
                                    : "N/A"}
                                </td>
                                <td>{s.timeTracked}</td>
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

      {/* ✅ Bulk action bar */}
      <section className="sv-sec1">
        <div className="sv-last-sec css-sec-last">
          <div className="sv-last-sec-inner css-sec-last-inner">
            <p className="mx-5">
              <span>{selectedCount}</span> items selected
            </p>
          </div>
          <div className="cpd-filters_inner" ref={bulkRef}>
            <div className="cpd-menu-bar">
              {/* Priority & Stage same */}
              {["priority", "status"].map((key) => (
                <div
                  key={key}
                  className={`btn_main ${
                    bulkDropdownOpen === key ? "open" : ""
                  }`}
                >
                  <div
                    className="dropdown_toggle"
                    onClick={() => handleBulkToggle(key)}
                  >
                    <span className="text_btn">{selections[key]}</span>
                    <img src="/SVG/arrow.svg" alt="arrow" />
                  </div>
                  {bulkDropdownOpen === key && (
                    <ul className="dropdown_menu">
                      {dropdownData[key].map((item, i) => (
                        <li key={i} onClick={() => handleBulkSelect(key, item)}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <div className="css-delete_btn d-flex gap-3">
                <button className="theme_btn" onClick={handleBulkUpdateBoth}>
                  Apply Changes
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="css-high css-delete"
                >
                  <img src="/SVG/delete-vec.svg" alt="del" /> Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Confirm delete modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Are you sure you want to delete this projects?</h3>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleConfirmDelete}>
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
    </section>
  );
};

export default TaskTimeboard;
