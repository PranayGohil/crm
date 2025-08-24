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
  const [assignedEmployee, setAssignedEmployee] = useState(null);

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

      const items = (subtaskData.media_files || []).map((file) => ({
        src: `${file}`,
        alt: file,
      }));
      setMediaItems(items);

      const { data: projectData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`
      );
      setProject(projectData.project);

      if (subtaskData.assign_to) {
        const { data: employeeData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get/${subtaskData.assign_to}`
        );
        setAssignedEmployee(employeeData);
      }

      if (projectData.project.client_id) {
        const { data: clientData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get/${projectData.project.client_id}`
        );
        setClient(clientData);
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
      if (data.related_id === subtaskId) {
        fetchData();
      }
    });

    socket.on("media_upload", (data) => {
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
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/subtask/change-status/${subtaskId}`,
        { status: editingStatus, userId: subtask.assign_to, userRole: "admin" }
      );
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
      setIsEditing(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg text-gray-800">
              Subtask Details : 
            </h1>
            <h1 className="text-2xl font-semibold text-gray-800">
              {project?.project_name || "Project Name"}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subtask Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {subtask.task_name || "Subtask Name"}
                </h2>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <span className="mr-4">Project ID: {project?._id}</span>
                  <span>Client: {client?.full_name || "N/A"}</span>
                </div>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Update"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subtask.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : subtask.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {subtask.status || "Status Unknown"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subtask.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : subtask.priority === "Medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {subtask.priority || "Priority Unknown"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stage:</span>
                  <span className="font-medium">{subtask.stage || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="font-medium">
                    {assignedEmployee?.full_name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">
                    {subtask.assign_date
                      ? formatDate(subtask.assign_date)
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-medium">{subtask.url || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{subtask.status || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {subtask.due_date ? formatDate(subtask.due_date) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-700">
                {subtask.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Attached Media
              </h2>
              <label
                htmlFor="mediaUpload"
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-200"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Media
                <input
                  type="file"
                  id="mediaUpload"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleUploadMedia(e.target.files)}
                />
              </label>
            </div>

            {mediaItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>No media attached.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                      <div className="flex space-x-2">
                        <a
                          href={item.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                        <button
                          onClick={() => {
                            setMediaToRemove(item.src);
                            setShowRemoveModal(true);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Comments
            </h2>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <img
                  src={profilePic}
                  alt="Your profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {[...comments]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, visibleCommentsCount)
                .map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3">
                    {comment.user_type === "admin" ? (
                      <>
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Admin</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                        <img
                          src={profilePic}
                          alt="Admin"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </>
                    ) : (
                      <>
                        {comment.user_id?.profile_pic ? (
                          <img
                            src={comment.user_id.profile_pic}
                            alt={comment.user_id.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {comment.user_id?.full_name
                              ? comment.user_id.full_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>
                        )}
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                              {comment.user_id?.full_name || "Unknown User"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}

              {visibleCommentsCount < comments.length && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setVisibleCommentsCount((prev) => prev + 7)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Load More Comments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Project Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Project Name</p>
                <p className="font-medium">{project?.project_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{client?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Project ID</p>
                <p className="font-medium">{project?._id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Assigned Employee */}
          {assignedEmployee && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Assigned To
              </h3>
              <div className="flex items-center space-x-3">
                {assignedEmployee.profile_pic ? (
                  <img
                    src={assignedEmployee.profile_pic}
                    alt={assignedEmployee.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {assignedEmployee.full_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="font-medium">{assignedEmployee.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {assignedEmployee.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Media Modal */}
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
