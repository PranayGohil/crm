import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Modal, Button } from "react-bootstrap"; // ✅ import modal
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { stageOptions, priorityOptions } from "../../../options";

const SubtaskDashboardContainer = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    assignTo: "",
    priority: "",
    stage: "",
  });

  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkStage, setBulkStage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

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

  const handleBulkUpdateAll = async () => {
    if (selectedTaskIds.length === 0) return;
    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;

    if (bulkPriority) update.priority = bulkPriority;
    if (bulkStage) update.stage = bulkStage;

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
      setBulkAssignTo("");
      setBulkPriority("");
      setBulkStage("");
      setSelectedTaskIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    const taskId = selectedSubtask;
    if (!taskId) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/subtask/delete/${taskId}`
      );
      toast.success("Deleted!");
      fetchSubtasks();
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkConfirmDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/bulk-delete`,
        { ids: selectedTaskIds }
      );
      toast.success("Deleted!");
      fetchSubtasks();
      setSelectedTaskIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

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
          <h3>Subtask View</h3>
          <p>{project?.project_name}</p>
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
                  <Link
                    to={`/project/subtask/edit/${task._id}`}
                    className="mx-1"
                  >
                    <img src="/SVG/edit.svg" alt="edit" />
                  </Link>
                  <span
                    onClick={() => {
                      setSelectedSubtask(task._id);
                      setShowDeleteModal(true);
                    }}
                    className="mx-1"
                    style={{ cursor: "pointer", color: "red" }}
                  >
                    <img src="/SVG/delete.svg" alt="delete" />
                  </span>
                  <Link to={`/subtask/view/${task._id}`} className="mx-1">
                    <img src="/SVG/eye-view.svg" alt="view" />
                  </Link>
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
          <select
            value={bulkAssignTo}
            onChange={(e) => setBulkAssignTo(e.target.value)}
            className="dropdown_toggle"
          >
            <option value="">Set Assign To</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.full_name}
              </option>
            ))}
          </select>

          <select
            value={bulkPriority}
            onChange={(e) => setBulkPriority(e.target.value)}
            className="dropdown_toggle"
          >
            <option value="">Set Priority</option>
            {priorityOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={bulkStage}
            onChange={(e) => setBulkStage(e.target.value)}
            className="dropdown_toggle"
          >
            <option value="">Change Stage</option>
            {stageOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

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
            onClick={() => setShowBulkDeleteModal(true)}
            disabled={selectedTaskIds.length === 0}
          >
            <img src="/SVG/delete-vec.svg" alt="del" /> Delete Selected
          </button>
        </div>
      </section>
      {/* ✅ Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete selected subtask?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showBulkDeleteModal}
        onHide={() => setShowBulkDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <b>{selectedTaskIds.length}</b>{" "}
          selected subtask(s)?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBulkDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SubtaskDashboardContainer;
