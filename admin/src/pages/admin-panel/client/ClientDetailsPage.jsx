// Admin Panel - Client Details Page
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-username/${id}`);
        const subtasksRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/tasks/${res.data._id}`);
        const clientData = { ...res.data, subtasks: subtasksRes.data || [] };
        setClient(clientData);

        const earningsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/earnings-report/${res.data._id}`);
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
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/client/delete/${client._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Client deleted successfully!");
      navigate("/client/dashboard");
    } catch (error) {
      toast.error("Failed to delete client");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!client) return (
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

  const InfoRow = ({ label, children }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <div className="font-medium text-gray-800 text-sm">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-semibold text-gray-800 truncate">{client.full_name}</h1>
              <div className="flex flex-wrap items-center gap-1 mt-0.5 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>Active</span>
                <span>•</span>
                <span className="truncate">ID: #{client._id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/client/edit/${client.username}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="hidden sm:inline">Edit Client</span>
              <span className="sm:hidden">Edit</span>
            </Link>
            <button onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span className="hidden sm:inline">Delete Client</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contact + Company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Contact & Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Username">{client.username}</InfoRow>
            <InfoRow label="Email">{client.email}</InfoRow>
            <InfoRow label="Phone">{client.phone}</InfoRow>
            <InfoRow label="Joining Date">{new Date(client.joining_date).toLocaleDateString()}</InfoRow>
            <div className="sm:col-span-2">
              <InfoRow label="Address">{client.address}</InfoRow>
            </div>
            <InfoRow label="Contact Method">Email</InfoRow>
            <InfoRow label="Client Type">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{client.client_type}</span>
            </InfoRow>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            Company Information
          </h2>
          <div className="space-y-3">
            <InfoRow label="Company Name">{client.company_name || "—"}</InfoRow>
            <InfoRow label="GST / VAT">{client.gst_number || "—"}</InfoRow>
            <InfoRow label="Website">
              {client.website
                ? <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{client.website}</a>
                : "—"}
            </InfoRow>
            <InfoRow label="LinkedIn">
              {client.linkedin
                ? <a href={client.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{client.linkedin}</a>
                : "—"}
            </InfoRow>
            <InfoRow label="Notes">{client.additional_notes || "—"}</InfoRow>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      {earnings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Earnings Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Value", value: `₹${earnings.summary.total_value.toLocaleString()}`, bg: "bg-gray-50 border-gray-100", text: "text-gray-800" },
              { label: "Earned", value: `₹${earnings.summary.earned_value.toLocaleString()}`, bg: "bg-green-50 border-green-100", text: "text-green-700" },
              { label: "Pending", value: `₹${earnings.summary.pending_value.toLocaleString()}`, bg: "bg-yellow-50 border-yellow-100", text: "text-yellow-700" },
              { label: "Completion", value: `${earnings.summary.completion_percentage}%`, bg: "bg-blue-50 border-blue-100", text: "text-blue-700" },
            ].map((s) => (
              <div key={s.label} className={`p-3 rounded-lg border text-center ${s.bg}`}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-base sm:text-xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Earning Progress</span>
              <span className="text-blue-600 font-semibold">{earnings.summary.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${earnings.summary.completion_percentage}%` }} />
            </div>
          </div>

          {client.stage_pricing?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Default Stage Pricing</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {client.stage_pricing.map((sp) => (
                  <div key={sp.stage_name} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500 mb-1">{sp.stage_name}</p>
                    <p className="text-sm font-semibold text-gray-800">₹{sp.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Per-Project Breakdown</p>
            <div className="space-y-2">
              {earnings.projects.map((proj) => {
                const pct = proj.total_value > 0 ? Math.round((proj.earned_value / proj.total_value) * 100) : 0;
                return (
                  <div key={proj.project_id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{proj.project_name}</p>
                        <span className="text-xs text-gray-400">{proj.status}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-green-700">
                          ₹{proj.earned_value.toLocaleString()}
                          <span className="text-gray-400 font-normal"> / ₹{proj.total_value.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-yellow-600">₹{proj.pending_value.toLocaleString()} pending</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          Task Summary
        </h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-gray-600">{completed} / {totalTasks} completed</span>
            <span className="font-semibold text-gray-700">{donePercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${donePercent}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: "Total", value: totalTasks, bg: "bg-gray-50", text: "text-gray-800" },
            { label: "To Do", value: todo, bg: "bg-blue-50", text: "text-blue-800" },
            { label: "In Progress", value: inProgress, bg: "bg-yellow-50", text: "text-yellow-800" },
            { label: "Paused", value: paused, bg: "bg-purple-50", text: "text-purple-800" },
            { label: "Blocked", value: blocked, bg: "bg-red-50", text: "text-red-800" },
            { label: "Completed", value: completed, bg: "bg-green-50", text: "text-green-800" },
          ].map((s) => (
            <div key={s.label} className={`p-3 rounded-lg text-center ${s.bg}`}>
              <p className={`text-xs mb-1 ${s.text}`}>{s.label}</p>
              <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal (Tailwind, no Bootstrap) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{client.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailsPage;