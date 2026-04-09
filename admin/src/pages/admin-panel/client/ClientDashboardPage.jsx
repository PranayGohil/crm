import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/with-subtasks`);
        setClients(res.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to fetch clients.");
        toast.error("Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return 0;
    });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">Client Dashboard</h1>
          </div>
          <Link
            to="/client/create"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14" />
            </svg>
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="p-4 bg-blue-100 text-blue-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold mt-1">{clients.length}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0">
                <img src="/SVG/icon-1.svg" alt="Total Clients" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-100 text-green-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium">Total Earned</p>
                <p className="text-2xl font-bold mt-1">
                  ₹{clients.flatMap((c) => c.subtasks || []).reduce((sum, s) => sum + (s.earned_amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-green-600 font-bold text-lg flex-shrink-0">₹</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium">Total Pending</p>
                <p className="text-2xl font-bold mt-1">
                  ₹{clients.flatMap((c) => c.subtasks || []).reduce((sum, s) => sum + ((s.total_price || 0) - (s.earned_amount || 0)), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-yellow-600 font-bold text-lg flex-shrink-0">₹</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">No clients found.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const subtasks = client.subtasks || [];
            const total = subtasks.length;
            const done = subtasks.filter((t) => t.status === "Completed").length;
            const inProgress = subtasks.filter((t) => t.status === "In Progress").length;
            const blocked = subtasks.filter((t) => t.status === "Blocked").length;
            const paused = subtasks.filter((t) => t.status === "Paused").length;
            const todo = subtasks.filter((t) => t.status === "To Do").length;
            const completedPercent = total > 0 ? Math.round((done / total) * 100) : 0;

            const totalValue = subtasks.reduce((sum, s) => sum + (s.total_price || 0), 0);
            const earnedValue = subtasks.reduce((sum, s) => sum + (s.earned_amount || 0), 0);
            const pendingValue = totalValue - earnedValue;
            const earningPercent = totalValue > 0 ? Math.round((earnedValue / totalValue) * 100) : 0;

            return (
              <div key={client._id || client.username} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Client Header */}
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{client.full_name}</h3>
                      <p className="text-sm text-gray-500 truncate">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <div className={"w-2 h-2 rounded-full " + (client.status === "active" ? "bg-green-500" : "bg-gray-400")} />
                      <span>{client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : "N/A"}</span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-4">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined: {client.joining_date ? new Date(client.joining_date).toLocaleDateString() : "N/A"}
                  </div>

                  {/* Task Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{done} / {total} Completed</span>
                      <span className="text-green-600 font-semibold">{completedPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completedPercent}%` }} />
                    </div>
                  </div>

                  {/* Earnings */}
                  {totalValue > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Earnings</p>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-800">₹{totalValue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-green-600">Earned</p>
                          <p className="text-xs sm:text-sm font-semibold text-green-700">₹{earnedValue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-yellow-600">Pending</p>
                          <p className="text-xs sm:text-sm font-semibold text-yellow-700">₹{pendingValue.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${earningPercent}%` }} />
                      </div>
                      <p className="text-right text-xs text-blue-600 mt-1">{earningPercent}% earned</p>
                    </div>
                  )}

                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {[
                      { label: "In Progress", value: inProgress, color: "bg-yellow-50 text-yellow-800" },
                      { label: "Completed", value: done, color: "bg-green-50 text-green-800" },
                      { label: "To Do", value: todo, color: "bg-blue-50 text-blue-800" },
                      { label: "Blocked", value: blocked, color: "bg-red-50 text-red-800" },
                      { label: "Paused", value: paused, color: "bg-purple-50 text-purple-800" },
                    ].map((s) => (
                      <div key={s.label} className={`flex flex-col items-center p-2 rounded-lg ${s.color}`}>
                        <span className="text-xs font-medium leading-tight text-center">{s.label}</span>
                        <span className="text-base font-bold mt-0.5">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/client/projects/${client.username}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      View Projects
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      to={`/client/details/${client.username}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Client Info
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientDashboardPage;