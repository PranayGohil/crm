//  Admin Panel - View Subtask Details Page
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  const [assignedEmployee, setAssignedEmployee] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingPriority, setEditingPriority] = useState("");
  const [saving, setSaving] = useState(false);

  const [mediaItems, setMediaItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(7);

  // Mobile: sidebar toggle
  const [showSidebar, setShowSidebar] = useState(false);

  const user = JSON.parse(localStorage.getItem("adminUser"));
  const userId = user?._id;
  const profilePic = user?.profile_pic || "/Image/admin.jpg";

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subtaskData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`);
      setSubtask(subtaskData);
      setComments(subtaskData.comments || []);
      setEditingStatus(subtaskData.status || "");
      setEditingPriority(subtaskData.priority || "");
      setMediaItems((subtaskData.media_files || []).map((file) => ({ src: file, alt: file })));

      const { data: projectData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`);
      setProject(projectData.project);

      if (subtaskData.assign_to) {
        const { data: employeeData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get/${subtaskData.assign_to}`);
        setAssignedEmployee(employeeData);
      }

      if (projectData.project.client_id) {
        const { data: clientData } = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get/${projectData.project.client_id}`);
        setClient(clientData);
      }
    } catch (error) {
      console.error("Failed to load subtask details:", error);
      toast.error("Failed to load subtask details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [subtaskId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("subtask_updated", (data) => {
      if (data._id === subtaskId) setSubtask((prev) => ({ ...prev, status: data.status, priority: data.priority }));
    });
    socket.on("comment", (data) => { if (data.related_id === subtaskId) fetchData(); });
    socket.on("media_upload", (data) => { if (data.related_id === subtaskId) fetchData(); });
    return () => { socket.off("subtask_updated"); socket.off("comment"); socket.off("media_upload"); };
  }, [socket, subtaskId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      setSaving(true);
      const requests = [];
      if (editingStatus !== subtask.status) {
        requests.push(axios.put(
          `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${subtaskId}`,
          { status: editingStatus, userId: subtask.assign_to, userRole: "admin" },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        ));
      }
      if (editingPriority !== subtask.priority) {
        requests.push(axios.put(
          `${process.env.REACT_APP_API_URL}/api/subtask/change-priority/${subtaskId}`,
          { priority: editingPriority },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        ));
      }
      if (requests.length === 0) { toast.info("No changes detected."); setIsEditing(false); return; }
      await Promise.all(requests);
      toast.success("Subtask updated successfully!");
      setSubtask((prev) => ({ ...prev, status: editingStatus, priority: editingPriority }));
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update subtask.");
    } finally {
      setLoading(false); setSaving(false);
    }
  };

  const handleUploadMedia = async (files) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_type", "admin");
      for (const file of files) formData.append("media_files", file);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-media/${subtaskId}`, formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMediaItems(data.media_files.map((url) => ({ src: url, alt: "Uploaded file" })));
      toast.success("Media uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally { setLoading(false); }
  };

  const handleRemoveConfirmed = async () => {
    if (!mediaToRemove) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/remove-media/${subtaskId}`,
        { mediaUrl: mediaToRemove, user_type: "admin", user_id: userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMediaItems(data.media_files.map((url) => ({ src: url, alt: "Uploaded file" })));
      toast.success("Media removed!");
    } catch (error) {
      toast.error("Failed to remove media");
    } finally { setShowRemoveModal(false); setMediaToRemove(null); setLoading(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/subtask/add-comment/${subtaskId}`,
        { user_type: "admin", text: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setComments(data.comments);
      setNewComment("");
    } catch (error) { toast.error("Failed to add comment"); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <p>Subtask not found!</p>;

  const totalPrice = subtask.total_price || 0;
  const earnedAmount = subtask.earned_amount || 0;
  const pendingAmount = totalPrice - earnedAmount;
  const earningPercent = totalPrice > 0 ? Math.round((earnedAmount / totalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Subtask Details</p>
              <h1 className="text-base sm:text-xl font-semibold text-gray-800 truncate">{project?.project_name || "Project Name"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Info
            </button>
            <Link to={`/subtask/logs/${subtask._id}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span className="hidden xs:inline">View Logs</span>
              <span className="xs:hidden">Logs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Subtask Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{subtask.task_name || "Subtask Name"}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                  <span className="truncate">ID: {project?._id}</span>
                  <span>· Client: {client?.full_name || "N/A"}</span>
                </div>
              </div>

              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select value={editingStatus} onChange={(e) => setEditingStatus(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1 min-w-0"
                    disabled={saving}>
                    <option value="">Status</option>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={editingPriority} onChange={(e) => setEditingPriority(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm flex-1 min-w-0"
                    disabled={saving}>
                    <option value="">Priority</option>
                    {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} disabled={saving}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                      {saving ? "…" : "Update"}
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={saving}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.status === "Completed" ? "bg-green-100 text-green-800" :
                    subtask.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                    }`}>{subtask.status || "Unknown"}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.priority === "High" ? "bg-red-100 text-red-800" :
                    subtask.priority === "Medium" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                    }`}>{subtask.priority || "Unknown"}</span>
                  <button onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">Edit</button>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="space-y-3">
                <div>
                  <span className="text-xs sm:text-sm text-gray-600 block mb-1">Stages:</span>
                  {Array.isArray(subtask.stages) && subtask.stages.length > 0 ? (
                    <div className="stages-container">
                      {subtask.stages.map((stg, i) => {
                        const name = typeof stg === "string" ? stg : stg.name;
                        const completed = stg?.completed;
                        return (
                          <div key={i} className="stage-flow">
                            <span className={`stage-badge ${completed ? "completed" : "pending"}`}>
                              {completed && <span className="check-icon">✓</span>}{name}
                            </span>
                            {i < subtask.stages.length - 1 && <span className="stage-arrow">→</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : <span className="no-data text-sm">No stages</span>}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <span className="font-medium text-sm">{assignedEmployee?.full_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Date:</span>
                  <span className="font-medium text-sm">{formatDate(subtask.assign_date)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">URL:</span>
                  <span className="font-medium text-sm truncate max-w-32">{subtask.url || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="font-medium text-sm">{subtask.status || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium text-sm">{formatDate(subtask.due_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 text-sm sm:text-base">{subtask.description || "No description available."}</p>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Attached Media</h2>
              <label htmlFor="mediaUpload"
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
                <input type="file" id="mediaUpload" multiple accept="image/*,application/pdf"
                  className="hidden" onChange={(e) => handleUploadMedia(e.target.files)} />
              </label>
            </div>
            {mediaItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No media attached.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-lg"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Image */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-28 sm:h-40 object-cover rounded-lg border border-gray-200"
                    />

                    {/* Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.6)",
                        opacity: hoveredIndex === index ? 1 : 0,
                        transition: "opacity 0.3s ease",
                        zIndex: 10,
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>

                        {/* View */}
                        <a
                          href={item.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "8px",
                            background: "#fff",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setMediaToRemove(item.src);
                            setShowRemoveModal(true);
                          }}
                          style={{
                            padding: "8px",
                            background: "#fff",
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Comments</h2>
            <div className="mb-5">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <img src={profilePic} alt="Your profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <input type="text" placeholder="Write a comment..." value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleAddComment}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[...comments]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, visibleCommentsCount)
                .map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2 sm:space-x-3">
                    {comment.user_type === "admin" ? (
                      <>
                        <div className="flex-1 bg-gray-50 p-3 sm:p-4 rounded-lg min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">Admin</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                        <img src={profilePic} alt="Admin" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                      </>
                    ) : (
                      <>
                        {comment.user_id?.profile_pic ? (
                          <img src={comment.user_id.profile_pic} alt={comment.user_id.full_name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                            {comment.user_id?.full_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1 bg-gray-50 p-3 sm:p-4 rounded-lg min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{comment.user_id?.full_name || "Unknown"}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              {visibleCommentsCount < comments.length && (
                <div className="text-center mt-3">
                  <button onClick={() => setVisibleCommentsCount((prev) => prev + 7)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — always visible on lg, toggleable on mobile */}
        <div className={`space-y-4 sm:space-y-6 ${showSidebar ? "block" : "hidden lg:block"}`}>
          {/* Mobile close button */}
          <div className="flex justify-end lg:hidden">
            <button onClick={() => setShowSidebar(false)} className="text-gray-500 text-sm flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Project Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Project Name</p>
                <p className="font-medium text-sm sm:text-base">{project?.project_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Client</p>
                <p className="font-medium text-sm sm:text-base">{client?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Project ID</p>
                <p className="font-medium text-xs break-all">{project?._id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Assigned Employee */}
          {assignedEmployee && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Assigned To</h3>
              <div className="flex items-center space-x-3">
                {assignedEmployee.profile_pic ? (
                  <img src={assignedEmployee.profile_pic} alt={assignedEmployee.full_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm sm:text-base">
                    {assignedEmployee.full_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">{assignedEmployee.full_name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{assignedEmployee.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Card */}
          {totalPrice > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Pricing
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">₹{totalPrice.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-green-600 mb-0.5">Earned</p>
                  <p className="text-xs sm:text-sm font-bold text-green-700">₹{earnedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-yellow-600 mb-0.5">Pending</p>
                  <p className="text-xs sm:text-sm font-bold text-yellow-700">₹{pendingAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-blue-600 font-medium">{earningPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${earningPercent}%` }}></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Stage Breakdown</p>
                <div className="space-y-1.5">
                  {subtask.stages?.map((stage, i) => {
                    const name = typeof stage === "string" ? stage : stage.name;
                    const price = stage.price || 0;
                    const completed = stage.completed || false;
                    return (
                      <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${completed ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          {completed ? (
                            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></span>
                          )}
                          <span className={`text-xs truncate ${completed ? "text-green-800 font-medium" : "text-gray-600"}`}>{name}</span>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ml-1 ${completed ? "text-green-700" : "text-gray-500"}`}>
                          ₹{price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Media Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Remove</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to remove this media?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleRemoveConfirmed}>Remove</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewSubtask;