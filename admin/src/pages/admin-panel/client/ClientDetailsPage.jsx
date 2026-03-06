import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { Modal, Button } from "react-bootstrap";

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [earnings, setEarnings] = useState(null); // ← NEW
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`
        );
        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/tasks/${res.data._id}`
        );
        const clientData = res.data;
        clientData.subtasks = subtasksRes.data || [];
        setClient(clientData);

        // ── Fetch earnings report ──
        const earningsRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/earnings-report/${res.data._id}`
        );
        setEarnings(earningsRes.data);
      } catch (error) {
        console.error("Failed to fetch client:", error);
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/client/delete/${client._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Client deleted successfully!");
      navigate("/client/dashboard");
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!client)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Client not found</p>
      </div>
    );

  const subtasks = client.subtasks || [];
  const totalTasks = subtasks.length;
  const completed = subtasks.filter((t) => t.status === "Completed").length;
  const todo = subtasks.filter((t) => t.status === "To Do").length;
  const inProgress = subtasks.filter((t) => t.status === "In Progress").length;
  const paused = subtasks.filter((t) => t.status === "Paused").length;
  const blocked = subtasks.filter((t) => t.status === "Blocked").length;
  const donePercent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{client.full_name}</h1>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Active</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">Client ID: #{client._id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/client/edit/${client.username}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Client
            </Link>
            <button onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete Client
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Contact & Identity Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Username</label>
                <p className="font-medium">{client.username}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <p className="font-medium">{client.phone}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Joining Date</label>
                <p className="font-medium">{new Date(client.joining_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <p className="font-medium">{client.address}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Preferred Contact Method</label>
                <p className="font-medium">Email</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Client Type</label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {client.client_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Company Name</label>
              <p className="font-medium">{client.company_name || "---"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">GST / VAT Number</label>
              <p className="font-medium">{client.gst_number || "---"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Website</label>
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800">{client.website}</a>
              ) : <p className="font-medium">---</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
              {client.linkedin ? (
                <a href={client.linkedin} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800">{client.linkedin}</a>
              ) : <p className="font-medium">---</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Additional Notes</label>
              <p className="font-medium">{client.additional_notes || "---"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Earnings Summary Section ── */}
      {earnings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Earnings Summary
          </h2>

          {/* Top summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total Contract Value</p>
              <p className="text-xl font-bold text-gray-800">₹{earnings.summary.total_value.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
              <p className="text-xs text-green-600 mb-1">Earned So Far</p>
              <p className="text-xl font-bold text-green-700">₹{earnings.summary.earned_value.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
              <p className="text-xs text-yellow-600 mb-1">Pending</p>
              <p className="text-xl font-bold text-yellow-700">₹{earnings.summary.pending_value.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
              <p className="text-xs text-blue-600 mb-1">Completion</p>
              <p className="text-xl font-bold text-blue-700">{earnings.summary.completion_percentage}%</p>
            </div>
          </div>

          {/* Earnings progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Earning Progress</span>
              <span className="text-blue-600 font-medium">{earnings.summary.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${earnings.summary.completion_percentage}%` }}></div>
            </div>
          </div>

          {/* ── Stage Pricing Defaults ── */}
          {client.stage_pricing?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Default Stage Pricing</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {client.stage_pricing.map((sp) => (
                  <div key={sp.stage_name} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{sp.stage_name}</p>
                    <p className="text-sm font-semibold text-gray-800">₹{sp.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Per-Project Earnings Breakdown ── */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Per-Project Breakdown</p>
            <div className="space-y-3">
              {earnings.projects.map((proj) => {
                const projPercent = proj.total_value > 0
                  ? Math.round((proj.earned_value / proj.total_value) * 100)
                  : 0;
                return (
                  <div key={proj.project_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{proj.project_name}</p>
                        <span className="text-xs text-gray-500">{proj.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-700">
                          ₹{proj.earned_value.toLocaleString()}
                          <span className="text-gray-400 font-normal"> / ₹{proj.total_value.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-yellow-600">₹{proj.pending_value.toLocaleString()} pending</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${projPercent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          Task Summary
        </h2>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600">
              Total Tasks: <span className="font-medium text-gray-800">{totalTasks}</span> /{" "}
              <span className="font-medium text-gray-800">{completed}</span> Completed
            </p>
            <span className="font-medium text-gray-800">{donePercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${donePercent}%` }}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 mb-1">To Do</p>
            <p className="text-2xl font-bold text-blue-800">{todo}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-sm text-yellow-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-800">{inProgress}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-600 mb-1">Paused</p>
            <p className="text-2xl font-bold text-purple-800">{paused}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-red-600 mb-1">Blocked</p>
            <p className="text-2xl font-bold text-red-800">{blocked}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-800">{completed}</p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {client.full_name}? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Client</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientDetailsPage;