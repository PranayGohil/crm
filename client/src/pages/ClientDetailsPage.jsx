// Client Panel > Client Details Page
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";

// ── Reusable label+value row (matches admin InfoRow) ───────────────────────
const InfoRow = ({ label, children }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
    <div className="font-medium text-gray-800 text-sm">{children}</div>
  </div>
);

const ClientDetailsPage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("clientUser");
        const clientUser = storedUser ? JSON.parse(storedUser) : null;

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get/${clientUser?._id}`
        );
        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/tasks/${res.data._id}`
        );
        setClient({ ...res.data, subtasks: subtasksRes.data || [] });
      } catch (error) {
        console.error("Failed to fetch client:", error);
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (loading) return <LoadingOverlay />;
  if (!client)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Client not found</p>
      </div>
    );

  // ── Task counts ────────────────────────────────────────────────────────
  const subtasks = client.subtasks || [];
  const totalTasks = subtasks.length;
  const completed = subtasks.filter((t) => t.status === "Completed").length;
  const todo = subtasks.filter((t) => t.status === "To Do").length;
  const inProgress = subtasks.filter((t) => t.status === "In Progress").length;
  const paused = subtasks.filter((t) => t.status === "Paused").length;
  const blocked = subtasks.filter((t) => t.status === "Blocked").length;
  const donePercent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-semibold text-gray-800 truncate">
                {client.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-1 mt-0.5 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>Active</span>
                <span>•</span>
                <span className="truncate">ID: #{client._id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact & Company ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">

        {/* Contact & Identity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Contact &amp; Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Username">{client.username}</InfoRow>
            <InfoRow label="Email">{client.email}</InfoRow>
            <InfoRow label="Phone">{client.phone}</InfoRow>
            <InfoRow label="Joining Date">
              {new Date(client.joining_date).toLocaleDateString()}
            </InfoRow>
            <div className="sm:col-span-2">
              <InfoRow label="Address">{client.address}</InfoRow>
            </div>
            <InfoRow label="Contact Method">Email</InfoRow>
            <InfoRow label="Client Type">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {client.client_type}
              </span>
            </InfoRow>
          </div>
        </div>

        {/* Company Information */}
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
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all">
                  {client.website}
                </a>
              ) : "—"}
            </InfoRow>
            <InfoRow label="LinkedIn">
              {client.linkedin ? (
                <a href={client.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all">
                  {client.linkedin}
                </a>
              ) : "—"}
            </InfoRow>
            <InfoRow label="Notes">{client.additional_notes || "—"}</InfoRow>
          </div>
        </div>
      </div>

      {/* ── Task Summary ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          Task Summary
        </h2>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-gray-600">{completed} / {totalTasks} completed</span>
            <span className="font-semibold text-gray-700">{donePercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${donePercent}%` }} />
          </div>
        </div>

        {/* Stat tiles */}
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

    </div>
  );
};

export default ClientDetailsPage;