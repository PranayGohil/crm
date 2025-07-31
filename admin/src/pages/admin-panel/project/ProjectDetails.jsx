import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../../../options";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingPriority, setEditingPriority] = useState("");
  const [saving, setSaving] = useState(false);

  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        const proj = projectRes.data.project;
        setProject(proj);
        setEditingStatus(proj.status || "");
        setEditingPriority(proj.priority || "");

        if (proj.client_id) {
          const clientRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/client/get/${proj.client_id}`
          );
          setClient(clientRes.data);
        }

        if (proj.assign_to && proj.assign_to.length > 0) {
          const employeeIds = proj.assign_to.map((a) => a.id);
          const employeesRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/employee/get-multiple`,
            { ids: employeeIds }
          );
          setAssignedEmployees(employeesRes.data.employees);
        }

        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
        );
        setSubTasks(subtasksRes.data || []);
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Count completed subtasks
    setCompletedCount(
      subTasks.filter((t) => t.status?.toLowerCase() === "completed").length
    );

    setProgressPercent(
      subTasks.length ? Math.round((completedCount / subTasks.length) * 100) : 0
    );
  }, [projectId]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/project/change-status/${projectId}`,
        { status: editingStatus }
      );
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/project/change-priority/${projectId}`,
        { priority: editingPriority }
      );

      setProject((prev) => ({
        ...prev,
        status: editingStatus,
        priority: editingPriority,
      }));
      toast.success("Project updated successfully.");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found!</p>;

  return (
    <div className="preview-page">
      <section className="pb-sec1 d-flex justify-content-between">
        <div>
          <a
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer" }}
            className="me-2"
          >
            <img src="/SVG/arrow-pc.svg" alt="arrow-pc" />
          </a>
          <span>Back</span>
        </div>
        <div className="d-flex">
          <Link
            to={`/project/view-content/${projectId}`}
            className="theme_btn me-2"
          >
            <img
              src="/SVG/eye-view.svg"
              alt="view"
              className="me-2"
              style={{ filter: "invert(1)" }}
            />{" "}
            <span>View Content</span>
          </Link>
          <Link to={`/project/edit/${project._id}`} className="theme_btn ms-2">
            <img
              src="/SVG/edit.svg"
              alt="edit"
              className="me-2"
              style={{ filter: "invert(1)" }}
            />
            Edit Project
          </Link>
        </div>
      </section>

      <section className="pb-sec2">
        <div className="pb-sec2-heading">
          <div className="pb-subtask-head">
            <h2>{project.project_name}</h2>
          </div>
        </div>
      </section>

      <section className="pb-sec-3 pb-sec2">
        <div className="pb-sec3-inner">
          <div className="pb-client-id">
            <div className="pb-pro-client pb-project-id">
              <p>Project ID: </p>
              <span>{project._id}</span>
            </div>
            <div className="pb-pro-client pb-client">
              <p>Client: </p>
              <span>{client?.full_name || "N/A"}</span>
            </div>
          </div>

          <div className="pb-subtask-process">
            {isEditing ? (
              <>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="dropdown_toggle"
                  disabled={saving}
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={editingPriority}
                  onChange={(e) => setEditingPriority(e.target.value)}
                  className="dropdown_toggle"
                  disabled={saving}
                >
                  <option value="">Select Priority</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="theme_btn mx-2"
                >
                  {saving ? "Saving..." : "Update"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="theme_secondary_btn"
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <a href="#" className="cdn-bg-color-yellow color_yellow me-2">
                  {project.status || "Status Unknown"}
                </a>
                <a href="#" className="cdn-bg-color-red color_red me-2">
                  {project.priority || "Priority Unknown"}
                </a>
                <button
                  onClick={() => setIsEditing(true)}
                  className="theme_btn btn-sm"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="pb-sec-4 pb-sec2">
        <div className="pb-sec4-inner pb-sec3-inner">
          <div className="pb-task-overview-head">
            <p>Project Overview</p>
          </div>
          <div className="pb-task-overview-inner">
            <div className="pb-task-view overview1">
              <div className="pb-taskinner">
                <p>Start Date:</p>
                <span>
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="pb-taskinner">
                <p>Due Date:</p>
                <span>
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="pb-task-view overview2">
              <div className="pb-taskinner">
                <p>Status:</p>
                <span>{project.status || "N/A"}</span>
              </div>

              <div className="pb-taskinner">
                <p>Completion:</p>
                <span className="d-flex flex-column">
                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">
                      {completedCount}/{subTasks.length}
                    </div>
                  </div>
                  <div className="md-project_card__progress_bar">
                    <div
                      className="md-project_card__progress_fill cdn-bg-color-blue"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-5 pb-sec2">
        <div className="pb-sec5-inner pb-sec3-inner d-flex flex-column">
          <div className="pb-task-overview-head">
            <p>Description</p>
          </div>
          <div className="pb-assigned-employees">
            <div className="pb-task-view overview1">
              <div className="pb-taskinner">
                <p>{project.description || "No description provided."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;
