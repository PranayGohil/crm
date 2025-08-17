import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../../../options";
import { Modal, Button } from "react-bootstrap";
import { useSocket } from "../../../contexts/SocketContext";

const ViewSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);

  const [subtask, setSubtask] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [assignedEmployee, setAssignedEmployee] = useState(null); // single employee

  const [isEditing, setIsEditing] = useState(false);

  const [editingStatus, setEditingStatus] = useState("");
  const [editingPriority, setEditingPriority] = useState("");
  const [saving, setSaving] = useState(false);

  const [mediaItems, setMediaItems] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(7);

  const user = JSON.parse(localStorage.getItem("adminUser"));
  const userId = user?._id;
  const profilePic = user?.profile_pic || "/Image/admin.jpg";

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subtaskData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
      );
      setSubtask(subtaskData);
      setComments(subtaskData.comments || []);
      setEditingStatus(subtaskData.status || "");
      setEditingPriority(subtaskData.priority || "");

      const path = subtaskData.path_to_files || "";
      const items = (subtaskData.media_files || []).map((file) => ({
        src: `${file}`,
        alt: file,
      }));
      setMediaItems(items);
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

  useEffect(() => {
    fetchData();
  }, [subtaskId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("subtask_updated", (data) => {
      if (data._id === subtaskId) {
        setSubtask((prev) => ({
          ...prev,
          status: data.status,
          priority: data.priority,
        }));
      }
    });

    socket.on("comment", (data) => {
      console.log("comment", data);
      if (data.related_id === subtaskId) {
        fetchData();
      }
    });

    socket.on("media_upload", (data) => {
      console.log("media_upload", data);
      if (data.related_id === subtaskId) {
        fetchData();
      }
    });

    return () => {
      socket.off("subtask_updated");
      socket.off("comment");
      socket.off("media_upload");
    };
  }, [socket, subtaskId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      setSaving(true);
      // update status
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${subtaskId}`,
        { status: editingStatus, userId: subtask.assign_to, userRole: "admin" }
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
      setLoading(false);
      setSaving(false);
    }
  };

  const handleUploadMedia = async (files) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_type", "admin");
      for (const file of files) {
        formData.append("media_files", file);
      }

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-media/${subtaskId}`,
        formData
      );

      setMediaItems(
        data.media_files.map((url) => ({ src: url, alt: "Uploaded file" }))
      );
      toast.success("Media uploaded!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConfirmed = async () => {
    if (!mediaToRemove) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/remove-media/${subtaskId}`,
        { mediaUrl: mediaToRemove, user_type: "admin", user_id: userId }
      );
      setMediaItems(
        data.media_files.map((url) => ({ src: url, alt: "Uploaded file" }))
      );
      toast.success("Media removed!");
    } catch (error) {
      console.error("Failed to remove media:", error);
      toast.error("Failed to remove media");
    } finally {
      setShowRemoveModal(false);
      setMediaToRemove(null);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-comment/${subtaskId}`,
        { user_type: "admin", text: newComment }
      );
      setComments(data.comments);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
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
    <div className="preview-page px-3">
      <section className="d-flex justify-content-between align-items-center px-3 pt-4 pb-3">
        <div className="pb-sec1-inner">
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
              Subtask Details{" "}
            </h1>
          </div>
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

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="theme_btn"
                >
                  {saving ? "Saving..." : "Update"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="theme_secondary_btn"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span
                  className={`mx-2  rounded p-2 md-status-${(
                    subtask.status || ""
                  )
                    .toLowerCase()
                    .replace(" ", "")}`}
                >
                  {subtask.status || "Status Unknown"}
                </span>
                <span
                  className={`mx-2 rounded p-2 md-status-${(
                    subtask.priority || ""
                  )
                    .toLowerCase()
                    .replace(" ", "")}`}
                >
                  {subtask.priority || "Priority Unknown"}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="theme_btn"
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
                <p>Url:</p>
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
        {subtask.url && (
          <div className="pb-sec5-inner pb-sec3-inner">
            <div className="pb-project-description">
              <h3>Url</h3>
              <p>{subtask.url || "No description available."}</p>
            </div>
          </div>
        )}
      </section>

      <section className="pb-sec-6 pb-sec2">
        <div className="pb-sec6-inner pb-sec3-inner">
          <h1>Attached Media</h1>
          <div className="pb-attached-photo-sec">
            <div className="pb-project-gallary">
              {mediaItems.length === 0 ? (
                <>
                  <div>No media attached.</div>
                  <br />
                </>
              ) : (
                mediaItems.map((item, index) => (
                  <div className="pb-gallary-img" key={index}>
                    <img
                      src={item.src}
                      alt={item.alt}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="pb-gall-icons">
                      <a
                        href={item.src}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="pb-media-icon">
                          <img src="/SVG/css-eye.svg" alt="view" />
                        </div>
                      </a>
                      <button
                        className="pb-media-icon bg-light"
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setMediaToRemove(item.src);
                          setShowRemoveModal(true);
                        }}
                      >
                        <img src="/SVG/delete.svg" alt="remove" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <label
              htmlFor="mediaUpload"
              className="pb-add-img mt-3"
              style={{ cursor: "pointer" }}
            >
              <img src="/SVG/plus-grey.svg" alt="add" />
              <span>Add Media</span>
              <input
                type="file"
                id="mediaUpload"
                multiple
                accept="image/*,application/pdf"
                className="d-none"
                onChange={(e) => handleUploadMedia(e.target.files)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="pb-sec-7 pb-sec2">
        <div className="pb-sec7-inner pb-sec3-inner">
          <div className="pb-sec7-heading">
            <h1>Comments</h1>
          </div>
          <div className="pb-add-post-comment mb-3">
            <div className="pb-add-comment d-flex justify-content-end">
              <div className="pb-type-comment">
                <input
                  type="text"
                  className="text-end px-3"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <img src={`${profilePic}`} alt="Riya Sharma" />
            </div>
            <div className="pb-add-components">
              <div></div>
              {/* <div className="pb-add-imgs">
                  <a href="#">
                    <img src="/SVG/add-photo.svg" alt="Add Photo" />
                  </a>
                  <a href="#">
                    <img src="/SVG/add-emoji.svg" alt="Add Emoji" />
                  </a>
                  <a href="#">
                    <img src="/SVG/mention.svg" alt="Mention" />
                  </a>
                </div> */}
              <div className="add-mbr">
                <div className="plus-icon">
                  <a onClick={handleAddComment}>
                    <span>Post Comment</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div>
            {[...comments]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, visibleCommentsCount)
              .map((comment) => (
                <div className="pb-client-comment" key={comment._id}>
                  {comment.user_type === "admin" ? (
                    <>
                      <div className="pb-comment-description d-flex justify-content-end">
                        <div
                          className="pb-comment-cilent-name"
                          style={{ width: "90%" }}
                        >
                          <div className="pb-name-time">
                            <div className="pb-cilent-name">
                              <h4>
                                {comment.user_type === "admin"
                                  ? "Admin"
                                  : comment.user_id?.full_name ||
                                    "Unknown User"}
                              </h4>
                            </div>
                            <p>
                              <span style={{ paddingRight: "6px" }}>
                                {formatDate(comment.created_at)}
                              </span>
                            </p>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                      </div>
                      <img
                        src={`${profilePic}`}
                        alt="Admin"
                        style={{ borderRadius: "50%" }}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className="pb-comment-description d-flex justify-content-start"
                        style={{ width: "90%" }}
                      >
                        {comment.user_id?.profile_pic ? (
                          <img
                            src={comment.user_id.profile_pic}
                            alt={comment.user_id.full_name}
                            style={{ borderRadius: "50%" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              backgroundColor: "#0a3749",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              border: "2px solid white",
                            }}
                          >
                            {comment.user_id?.full_name
                              ? comment.user_id.full_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>
                        )}

                        <div className="pb-comment-description">
                          <div className="pb-comment-cilent-name">
                            <div className="pb-name-time">
                              <div className="pb-cilent-name">
                                <h4>
                                  {comment.user_type === "admin"
                                    ? "Admin"
                                    : comment.user_id?.full_name ||
                                      "Unknown User"}
                                </h4>
                              </div>
                              <p>
                                <span style={{ paddingRight: "6px" }}>
                                  {formatDate(comment.created_at)}
                                </span>
                              </p>
                            </div>
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            {visibleCommentsCount < comments.length && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  onClick={() => setVisibleCommentsCount((prev) => prev + 7)}
                  className="theme_secondary_btn"
                >
                  See more comments
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Modal
        show={showRemoveModal}
        onHide={() => setShowRemoveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this media?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemoveConfirmed}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewSubtask;
