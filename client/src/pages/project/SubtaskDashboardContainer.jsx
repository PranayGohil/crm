import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import LoadingOverlay from "../../components/LoadingOverlay";

// Dropdown component supports custom renderItem
const Dropdown = ({ label, options, selected, setSelected, renderItem }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`btn_main${open ? " open" : ""}`} ref={ref}>
      <div className="dropdown_toggle" onClick={() => setOpen(!open)}>
        <span className="text_btn">
          {selected?.label || selected?.name || selected?.full_name || label}
        </span>
        <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
      </div>
      {open && (
        <ul className="dropdown_menu">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)}>
              {renderItem ? renderItem(option) : option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SubtaskDashboardContainer = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    assignTo: "",
    priority: "",
    stage: "",
  });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState(null);
  const [bulkPriority, setBulkPriority] = useState(null);
  const [bulkStage, setBulkStage] = useState(null);

  const priorityOptions = [
    { label: "High", className: "css-high", icon: "/SVG/high-vec.svg" },
    { label: "Medium", className: "css-medium", icon: "/SVG/mid-vec.svg" },
    { label: "Low", className: "css-low", icon: "/SVG/cpd-info-blue.svg" },
  ];

  const stageOptions = [
    { label: "Render", className: "css-render" },
    { label: "Stone", className: "css-Stone" },
    { label: "Cad-design", className: "Cad-design" },
  ];

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
      );
      setSubtasks(res.data);
      // keep selectedTaskIds if they still exist
      const newIds = res.data.map((t) => t._id);
      setSelectedTaskIds((prev) => prev.filter((id) => newIds.includes(id)));
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
      (!filters.assignTo ||
        task.asign_to?.some((a) => a.id === filters.assignTo._id)) &&
      (!filters.priority || task.priority === filters.priority.label) &&
      (!filters.stage || task.stage === filters.stage.label)
  );

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/bulk-delete`,
        {
          ids: selectedTaskIds,
        }
      );
      toast.success("Deleted!");
      fetchSubtasks();
      setSelectedTaskIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateAll = async () => {
    if (selectedTaskIds.length === 0) return;
    const update = {};
    if (bulkAssignTo) {
      update.asign_to = [{ role: "Employee", id: bulkAssignTo._id }];
    }
    if (bulkPriority) {
      update.priority = bulkPriority.label;
    }
    if (bulkStage) {
      update.stage = bulkStage.label;
    }

    if (Object.keys(update).length === 0) {
      toast.info("No changes selected.");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/bulk-update`,
        { ids: selectedTaskIds, update }
      );
      toast.success("Changes applied!");
      fetchSubtasks();
      // Optional: reset bulk fields
      setBulkAssignTo(null);
      setBulkPriority(null);
      setBulkStage(null);
      setSelectedTaskIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <>
      {/* Header */}
      <section className="sv-sec1 header">
        <div className="sv-sec1-inner">
          <h1>Subtask View</h1>
          <p>Main-project name</p>
        </div>
      </section>

      {/* Top buttons */}
      <section className="sv-sec2 sv-sec1">
        <p>
          <a href="#">{filteredSubtasks.length}</a> Subtasks Total
        </p>
        <div className="cd-client_dashboard cd-client-d-flex">
          <Link to={`/project/subtask/add/${projectId}`} className="plus-icon">
            <img src="/SVG/plus.svg" alt="plus" /> <span>New Subtask</span>
          </Link>
          <Link to={`/project/edit-content/${projectId}`} className="plus-icon">
            <img src="/SVG/plus.svg" alt="plus" /> <span>New Content</span>
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="sv-sec3 cpd-filters_section">
        <div className="cpd-menu-bar">
          <Dropdown
            label="Assign To"
            options={employees}
            selected={filters.assignTo}
            setSelected={(v) =>
              setFilters((prev) => ({ ...prev, assignTo: v }))
            }
            renderItem={(emp) => (
              <span className="css-ankit">
                <img
                  src={emp.profile_pic || "/Image/default.png"}
                  alt="person"
                />{" "}
                {emp.full_name}
              </span>
            )}
          />
          <Dropdown
            label="Priority"
            options={priorityOptions}
            selected={filters.priority}
            setSelected={(v) =>
              setFilters((prev) => ({ ...prev, priority: v }))
            }
            renderItem={(opt) => (
              <span className={`css-priority ${opt.className}`}>
                <img src={opt.icon} alt="priority" /> {opt.label}
              </span>
            )}
          />
          <Dropdown
            label="Stage"
            options={stageOptions}
            selected={filters.stage}
            setSelected={(v) => setFilters((prev) => ({ ...prev, stage: v }))}
            renderItem={(opt) => (
              <span className={`css-stage ${opt.className}`}>{opt.label}</span>
            )}
          />
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
      <section className="sv-sec-table">
        <table className="subtask-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedTaskIds(
                      e.target.checked ? filteredSubtasks.map((t) => t._id) : []
                    )
                  }
                />
              </th>
              <th>Subtask Name</th>
              <th>Description</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubtasks.map((task) => (
              <tr key={task._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(task._id)}
                    onChange={(e) =>
                      setSelectedTaskIds((prev) =>
                        e.target.checked
                          ? [...prev, task._id]
                          : prev.filter((id) => id !== task._id)
                      )
                    }
                  />
                </td>
                <td>{task.task_name}</td>
                <td>{task.description}</td>
                <td>{task.stage}</td>
                <td>{task.priority}</td>
                <td>
                  {task.asign_to && task.asign_to.length > 0
                    ? (() => {
                        const assignedEmp = employees.find(
                          (emp) => emp._id === task.asign_to[0].id
                        );
                        return assignedEmp ? (
                          <span className="css-ankit">
                            <img
                              src={
                                assignedEmp.profile_pic || "/Image/default.png"
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
                          task.asign_to[0].id
                        );
                      })()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Bulk actions */}
      <section className="sv-last-sec css-sec-last">
        <p>
          <span>{selectedTaskIds.length}</span> items selected
        </p>
        <div className="cpd-menu-bar">
          <Dropdown
            label="Assign To"
            options={employees}
            selected={bulkAssignTo}
            setSelected={setBulkAssignTo}
            renderItem={(emp) => (
              <span className="css-ankit">
                <img
                  src={emp.profile_pic || "/Image/default.png"}
                  alt="person"
                />{" "}
                {emp.full_name}
              </span>
            )}
          />

          <Dropdown
            label="Set Priority"
            options={priorityOptions}
            selected={bulkPriority}
            setSelected={setBulkPriority}
            renderItem={(opt) => (
              <span className={`css-priority ${opt.className}`}>
                <img src={opt.icon} alt="priority" /> {opt.label}
              </span>
            )}
          />

          <Dropdown
            label="Change Stage"
            options={stageOptions}
            selected={bulkStage}
            setSelected={setBulkStage}
            renderItem={(opt) => (
              <span className={`css-stage ${opt.className}`}>{opt.label}</span>
            )}
          />
          <button
            onClick={handleBulkUpdateAll}
            className="theme_btn"
            disabled={
              selectedTaskIds.length === 0 ||
              (!bulkAssignTo && !bulkPriority && !bulkStage)
            }
          >
            Apply Changes
          </button>

          <button
            className="css-high css-delete"
            onClick={handleBulkDelete}
            disabled={selectedTaskIds.length === 0}
          >
            <img src="/SVG/delete-vec.svg" alt="del" /> Delete Selected
          </button>
        </div>
      </section>
    </>
  );
};

export default SubtaskDashboardContainer;
