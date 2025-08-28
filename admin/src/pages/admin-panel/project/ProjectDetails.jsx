import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);

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
    const completed = subTasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    ).length;
    setCompletedCount(completed);
    setProgressPercent(
      subTasks.length ? Math.round((completed / subTasks.length) * 100) : 0
    );
  }, [subTasks]);

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

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/project/delete/${projectId}`
      );
      toast.success("Project deleted successfully.");
      navigate("/project/dashboard");
    } catch (err) {
      toast.error((err.response?.data?.message || "Failed to delete project."));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleArchive = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/project/archive/${projectId}`
      );
      toast.success("Project archived successfully.");
      navigate("/project/dashboard");
    } catch (err) {
      toast.error("Failed to archive project.");
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/project/unarchive/${projectId}`
      );
      toast.success("Project unarchived successfully.");
      navigate("/archived-projects");
    } catch (err) {
      toast.error("Failed to unarchive project.");
    }
  };

  const currency = project?.content?.[0]?.currency || "INR";
  const totalPrice = project?.content?.[0]?.total_price || 0;

  if (loading) return <LoadingOverlay />;
  if (!project) return <p>Project not found!</p>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
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
              <h1 className="text-2xl font-semibold text-gray-800">
                Project Details
              </h1>
            </div>
            <div className="flex gap-2">
              {project.isArchived ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  onClick={() => setShowUnarchiveModal(true)}
                  style={{ border: "1px solid red", color: "red" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4" />
                  </svg>
                  Unarchive Project
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  onClick={() => setShowArchiveModal(true)}
                  style={{ border: "1px solid red", color: "red" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4" />
                  </svg>
                  Archive Project
                </button>
              )}

              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => setShowDeleteModal(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Project
              </button>
              <Link
                to={`/project/edit/${project._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Project
              </Link>
            </div>
          </div>
        </div>

        {/* Project Title */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {project.project_name}
          </h2>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600">Project ID:</span>
                <span className="font-medium">{project._id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium">
                  {client?.full_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Update"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status || "Status Unknown"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : project.priority === "Medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {project.priority || "Priority Unknown"}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Project Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{project.status || "N/A"}</span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">
                    {completedCount}/{subTasks.length} subtasks
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Description
            </h3>
            <p className="text-gray-700">
              {project.content?.[0]?.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Project Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Project Content
            </h3>
            <p className="text-gray-600">
              Manage all project content, items, and pricing details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Jewelry Items & Pricing
              </h4>
              {project?.content?.[0]?.items?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jewelry Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price per Item ({currency})
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total ({currency})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.content[0].items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.price}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity * item.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-4 text-sm font-medium text-gray-900"
                        >
                          Sub Total
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {project.content[0].items.reduce(
                            (sum, i) => sum + i.quantity * i.price,
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No items added yet.</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Pricing Overview
              </h4>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-2">Total Project Price</p>
                <p className="text-2xl font-bold text-blue-800">
                  {currency} {totalPrice}
                </p>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
                Content Included
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-1">Media</h5>
                <p className="text-gray-600 mb-2">Uploaded Media</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {project?.content?.[0]?.uploaded_files?.length || 0} files
                  </span>
                  <Link
                    to={`/project/gallery/${projectId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {project?.content?.[0]?.uploaded_files?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Media Preview
              </h3>
              <Link
                to={`/project/gallery/${projectId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.content[0].uploaded_files.slice(0, 3).map((url, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`media${idx}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showArchiveModal}
        onHide={() => setShowArchiveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Archive</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to archive this project?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowArchiveModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleArchive}>
            Archive
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showUnarchiveModal}
        onHide={() => setShowUnarchiveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Unarchive</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to unarchive this project?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUnarchiveModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleUnarchive}>
            Unarchive
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProjectDetails;
