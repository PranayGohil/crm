import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../../../options";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

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
      setLoading(true);
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
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  useEffect(() => {
    setCompletedCount(
      subTasks.filter((t) => t.status?.toLowerCase() === "completed").length
    );
    setProgressPercent(
      subTasks.length ? Math.round((completedCount / subTasks.length) * 100) : 0
    );
  }, [subTasks, completedCount]);

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

  const currency = project?.content?.[0]?.currency || "INR";
  const totalPrice = project?.content?.[0]?.total_price || 0;

  if (loading) return <LoadingOverlay />;
  if (!project) return <p>Project not found!</p>;

  return (
    <div className="preview-page p-3">
      <section className="pb-sec1 d-flex justify-content-between">
        <div className="anp-header-inner">
          <div className="anp-heading-main">
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
                className="mx-2"
                style={{ scale: "1.3" }}
              />
            </div>
            <div className="head-menu">
              <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                Project Details{" "}
              </h1>
            </div>
          </div>
        </div>
        <div width="165px">
          <Link to={`/project/edit/${project._id}`} className="theme_btn d-flex align-items-center">
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
            <div className="pb-task-view overview1 row">
              <div className="pb-taskinner row">
                <div className="col-md-4">Start Date:</div>
                <div className="col-md-8">
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div className="pb-taskinner row">
                <div className="col-md-4">Due Date:</div>
                <div className="col-md-8">
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
            <div className="pb-task-view overview2 row">
              <div className="pb-taskinner">
                <div className="col-md-4">Status:</div>
                <div className="col-md-8">{project.status || "N/A"}</div>
              </div>
              <div className="pb-taskinner">
                <div className="col-md-4">Completion:</div>
                <div className="col-md-8 d-flex flex-column">
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
                </div>
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
                <p>
                  {project.content[0].description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Content */}
      <section className="pc-main-content">
        <div className="pc-content-inner-txt">
          <h4>Project Content</h4>
          <span>Manage all project content, items, and pricing details</span>
        </div>
      </section>

      <section className="pc-price-and-overview pc-sec-content">
        <div className="pc-item-price">
          <div className="pc-item-price-inner">
            <h2>Jewelry Items & Pricing</h2>
          </div>
          <div className="pc-item-table">
            {project?.content?.[0]?.items?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Jewelry Item</th>
                    <th>Quantity</th>
                    <th>Price per Item ({currency})</th>
                    <th>Total ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {project.content[0].items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">Sub Total</td>
                    <td>
                      {project.content[0].items.reduce(
                        (sum, i) => sum + i.quantity * i.price,
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>No items added yet.</p>
            )}
          </div>
        </div>

        <div className="pc-pricing-overview">
          <div className="pc-prc-inner">
            <div className="prc-txt">
              <h2>Pricing Overview</h2>
            </div>
          </div>
          <div className="pc-total-project-price">
            <p>Total Project Price</p>
            <span>
              {currency} {totalPrice}
            </span>
          </div>
        </div>
      </section>

      <section className="pc-content-include">
        <div className="pc-content-inner">
          <h2>Content Included</h2>
        </div>
        <div className="pc-photo-video">
          <div className="pc-content-photo">
            <div className="pc-photo-detail">
              <div className="photo-video-inner">
                <div className="not-completed-text">
                  <h3>Media</h3>
                  <p>Uploaded Media</p>
                </div>
              </div>
              <div className="pc-item-contain">
                <span>
                  {project?.content?.[0]?.uploaded_files?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pc-notes-description">
        <div className="pc-not-des-inner">
          <h2>Project Notes / Description</h2>
        </div>
        <div className="pc-description">
          <span>
            {project?.content?.[0]?.description || "No description added."}
          </span>
        </div>
      </section>

      <section className="pc-media-preview">
        <div className="pc-media-preview-inner">
          <h2>Media Preview</h2>
          <a href={`/project/gallery/${projectId}`}>View All</a>
        </div>
        <div className="pc-media-pre-imgs">
          {project?.content?.[0]?.uploaded_files?.length > 0 ? (
            project.content[0].uploaded_files
              .slice(0, 3)
              .map((url, idx) => (
                <img key={idx} src={url} alt={`media${idx}`} />
              ))
          ) : (
            <p>No media uploaded.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;
