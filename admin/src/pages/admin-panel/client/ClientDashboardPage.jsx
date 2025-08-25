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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch clients + subtasks from API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/with-subtasks`
        );
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

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
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
              Client Dashboard
            </h1>
          </div>
          <Link
            to="/client/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
            <span className="ml-2">Add Client</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-blue-100 text-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                <img
                  src="/SVG/icon-1.svg"
                  alt="Total Clients"
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">Loading clients...</p>
          </div>
        ) : error ? (
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

            const done = subtasks.filter(
              (t) => t.status === "Completed"
            ).length;
            const inProgress = subtasks.filter(
              (t) => t.status === "In Progress"
            ).length;
            const blocked = subtasks.filter(
              (t) => t.status === "Blocked"
            ).length;
            const paused = subtasks.filter((t) => t.status === "Paused").length;
            const todo = subtasks.filter((t) => t.status === "To Do").length;

            const completedPercent =
              total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={client._id || client.username}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Client Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {client.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      Joined:{" "}
                      {client.joining_date
                        ? new Date(client.joining_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        Total Tasks: <span className="font-medium">{done}</span>{" "}
                        / <span className="font-medium">{total}</span> Completed
                      </span>
                      <span className="text-green-600 font-medium">
                        {completedPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${completedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col items-center p-2 bg-yellow-50 rounded">
                      <span className="text-sm text-yellow-800">
                        In Progress
                      </span>
                      <span className="text-lg font-semibold text-yellow-800">
                        {inProgress}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-800">Completed</span>
                      <span className="text-lg font-semibold text-green-800">
                        {done}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded">
                      <span className="text-sm text-blue-800">To Do</span>
                      <span className="text-lg font-semibold text-blue-800">
                        {todo}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-red-50 rounded">
                      <span className="text-sm text-red-800">Blocked</span>
                      <span className="text-lg font-semibold text-red-800">
                        {blocked}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-purple-50 rounded">
                      <span className="text-sm text-purple-800">Paused</span>
                      <span className="text-lg font-semibold text-purple-800">
                        {paused}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Link
                      to={`/client/projects/${client.username}`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Project
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                    <Link
                      to={`/client/details/${client.username}`}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
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
