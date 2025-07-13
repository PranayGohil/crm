import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../../../options";

const ViewSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();

  const [subtask, setSubtask] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [assignedEmployee, setAssignedEmployee] = useState(null); // single employee
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [editingStatus, setEditingStatus] = useState("");
  const [editingPriority, setEditingPriority] = useState("");
  const [saving, setSaving] = useState(false);

  const mediaItems = [
    { src: "/Image/jwell1.png", alt: "g-i1" },
    { src: "/Image/jwell2.png", alt: "g-i2" },
    { src: "/Image/jwell1.png", alt: "g-i1" },
    { src: "/Image/jwell3.png", alt: "g-i2" },
  ];

  const comments = [
    {
      id: 1,
      name: "Emma Davis",
      role: "Project Manager",
      timeAgo: "2 days ago",
      text: "Please make sure to include the smaller diamond details as specified in the client brief. They want exactly 16 stones in the halo setting.",
      avatar: "/Image/prn1.png",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: subtaskData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
        );
        setSubtask(subtaskData);
        setEditingStatus(subtaskData.status || "");
        setEditingPriority(subtaskData.priority || "");

        console.log("Subtask Data:", subtaskData);

        const { data: projectData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`
        );
        setProject(projectData.project);
        console.log("Project Data:", projectData);

        if (subtaskData.assign_to) {
          const { data: employeeData } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/employee/get/${subtaskData.assign_to}`
          );
          setAssignedEmployee(employeeData);
          console.log("Assigned Employee Data:", employeeData);
        }

        if (projectData.project.client_id) {
          const { data: clientData } = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/client/get/${projectData.project.client_id}`
          );
          setClient(clientData);
          console.log("Client Data:", clientData);
        }
      } catch (error) {
        console.error("Failed to load subtask details:", error);
        toast.error("Failed to load subtask details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subtaskId]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      // update status
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${subtaskId}`,
        { status: editingStatus }
      );
      // update priority
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/change-priority/${subtaskId}`,
        { priority: editingPriority }
      );

      toast.success("Subtask updated successfully!");
      setSubtask((prev) => ({
        ...prev,
        status: editingStatus,
        priority: editingPriority,
      }));
      setIsEditing(false); // exit editing mode
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <p>Subtask not found!</p>;

  return (
    <div className="preview-page">
      <section className="pb-sec1">
        <div className="pb-sec1-inner">
          <a onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <img src="/SVG/arrow-pc.svg" alt="arrow-pc" />
          </a>
          <span>Back</span>
        </div>
      </section>

      <section className="pb-sec2">
        <div className="pb-sec2-heading">
          <div className="pb-subtask-head">
            <h2>{project?.project_name || "Project Name"}</h2>
            <p>{subtask.task_name || "Subtask Name"}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-3 pb-sec2">
        <div className="pb-sec3-inner">
          <div className="pb-client-id">
            <div className="pb-pro-client pb-project-id">
              <p>Project ID: </p>
              <span>{project?._id}</span>
            </div>
            <div className="pb-pro-client pb-client">
              <p>Client: </p>
              <span>{client?.full_name || "N/A"}</span>
            </div>
          </div>
          <div>
            {isEditing ? (
              <div className="d-flex align-items-center gap-2">
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

                <button onClick={handleUpdate} disabled={saving} className="theme_btn">
                  {saving ? "Saving..." : "Update"}
                </button>
                <button onClick={() => setIsEditing(false)} disabled={saving} className="theme_secondary_btn">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="cdn-bg-color-yellow color_yellow mx-2  rounded p-2">
                  {subtask.status || "Status Unknown"}
                </span>
                <span className="cdn-bg-color-red color_red mx-2 rounded p-2">
                  {subtask.priority || "Priority Unknown"}
                </span>
                <button onClick={() => setIsEditing(true)} className="theme_btn">Edit</button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="pb-sec-4 pb-sec2">
        <div className="pb-sec4-inner pb-sec3-inner">
          <div className="pb-task-overview-head">
            <p>Task Overview</p>
          </div>
          <div className="pb-task-overview-inner">
            <div className="pb-task-view overview1">
              <div className="pb-taskinner">
                <p>Stage:</p>
                <span>{subtask.stage || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Assigned To:</p>
                <span>{assignedEmployee?.full_name || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Start Date:</p>
                <span>
                  {subtask.assign_date
                    ? formatDate(subtask.assign_date)
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="pb-task-view overview2">
              <div className="pb-taskinner">
                <p>Created By:</p>
                <span>{client?.full_name || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Status:</p>
                <span>{subtask.status || "N/A"}</span>
              </div>
              <div className="pb-taskinner">
                <p>Due Date:</p>
                <span>
                  {subtask.due_date ? formatDate(subtask.due_date) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-sec-5 pb-sec2">
        <div className="pb-sec5-inner pb-sec3-inner">
          <div className="pb-project-description">
            <h3>Description</h3>
            <p>{subtask.description || "No description available."}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-6 pb-sec2">
        <div className="pb-sec6-inner pb-sec3-inner">
          <h1>Attached Media</h1>
          <div className="pb-attached-photo-sec">
            <div className="pb-project-gallary">
              {mediaItems.map((item, index) => (
                <div className="pb-gallary-img" key={index}>
                  <img src={item.src} alt={item.alt} />
                  <div className="pb-gall-icons">
                    <a href="#">
                      <div className="pb-media-icon">
                        <img src="/SVG/css-eye.svg" alt="view" />
                      </div>
                    </a>
                    <a href="#">
                      <div className="pb-media-icon">
                        <img src="/SVG/download-photo.svg" alt="download" />
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pb-add-img">
            <img src="/SVG/plus-grey.svg" alt="add" />
            <span>Add Media</span>
          </div>
        </div>
      </section>

      <section className="pb-sec-7 pb-sec2">
        <div className="pb-sec7-inner pb-sec3-inner">
          <div className="pb-sec7-heading">
            <h1>Comments</h1>
            <p>
              <span style={{ paddingRight: "4px" }}>{comments.length}</span>
              comments
            </p>
          </div>

          <div className="pb-comment-sec">
            {comments.map((comment) => (
              <div className="pb-client-comment" key={comment.id}>
                <img src={comment.avatar} alt={comment.name} />
                <div className="pb-comment-description">
                  <div className="pb-comment-cilent-name">
                    <div className="pb-name-time">
                      <div className="pb-cilent-name">
                        <h4>{comment.name}</h4>
                        <span>{comment.role}</span>
                      </div>
                      <p>
                        <span style={{ paddingRight: "6px" }}>
                          {comment.timeAgo}
                        </span>
                      </p>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                  <div className="pb-comments-btns">
                    <a href="#">Reply</a>
                    <a href="#">Like</a>
                  </div>
                </div>
              </div>
            ))}

            <div className="pb-add-post-comment">
              <div className="pb-add-comment">
                <img src="/Image/Riya Sharma.png" alt="Riya Sharma" />
                <div className="pb-type-comment">
                  <input type="text" placeholder="Write a comment..." />
                </div>
              </div>
              <div className="pb-add-components">
                <div className="pb-add-imgs">
                  <a href="#">
                    <img src="/SVG/add-photo.svg" alt="Add Photo" />
                  </a>
                  <a href="#">
                    <img src="/SVG/add-emoji.svg" alt="Add Emoji" />
                  </a>
                  <a href="#">
                    <img src="/SVG/mention.svg" alt="Mention" />
                  </a>
                </div>
                <div className="add-mbr">
                  <div className="plus-icon">
                    <a href="#">
                      <span>Post Comment</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewSubtask;
