import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../contexts/SocketContext";

const EmployeeNotificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { notifications, setNotifications } = useSocket();
  const [activeFilter, setActiveFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [globalFilter, setGlobalFilter] = useState("");

  const filters = [
    { key: "All", label: "All", icon: "📋" },
    { key: "Task Updates", label: "Tasks", icon: "📝" },
    { key: "Comments", label: "Comments", icon: "💬" },
    { key: "Media Uploads", label: "Media", icon: "📎" },
  ];

  const employeeUser = JSON.parse(localStorage.getItem("employeeUser"));
  const employeeId = employeeUser?._id;
  const receiverType = "employee";

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      setLoading(true);
      try {
        // 1. Fetch notifications
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification/get`,
          {
            params: {
              receiver_id: employeeId,
              receiver_type: receiverType,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("employeeToken")}`,
            },
          }
        );

        setNotifications(res.data.notifications);

        // 2. Mark all as read in the backend
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/notification/mark-all-read`,
          {
            receiver_id: employeeId,
            receiver_type: receiverType,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("employeeToken")}`,
            },
          }
        );

        // 3. Update local state so unread count is zero immediately
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (error) {
        console.error("Error fetching/marking notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchAndMarkNotifications();
    }
  }, [employeeId, setNotifications]);

  // Filter notifications based on type and search
  const filteredNotifications = notifications.filter((n) => {
    // Filter by category
    let matchesFilter = false;
    if (activeFilter === "All") {
      matchesFilter = true;
    } else if (activeFilter === "Task Updates") {
      matchesFilter = n.type === "subtask_updated" || n.type === "task_update";
    } else if (activeFilter === "Comments") {
      matchesFilter = n.type === "comment";
    } else if (activeFilter === "Due Dates") {
      matchesFilter = n.type === "overdue" || n.type === "deadline";
    } else if (activeFilter === "Media Uploads") {
      matchesFilter = n.type === "media_upload";
    }

    // Filter by search term
    if (!matchesFilter) return false;
    if (!globalFilter) return true;

    const searchTerm = globalFilter.toLowerCase();
    return (
      n.title?.toLowerCase().includes(searchTerm) ||
      n.description?.toLowerCase().includes(searchTerm) ||
      n.type?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, globalFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case "subtask_updated":
      case "task_update":
        return "📝";
      case "comment":
        return "💬";
      case "overdue":
      case "deadline":
        return "⏰";
      case "media_upload":
        return "📎";
      default:
        return "📋";
    }
  };

  const getNotificationTypeBadge = (type) => {
    switch (type) {
      case "subtask_updated":
      case "task_update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "comment":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
      case "deadline":
        return "bg-red-100 text-red-800 border-red-200";
      case "media_upload":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-5 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 mb-3 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => navigate(-1)}
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 18l-6-6 6-6"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Notification Center
            </h1>
          </div>
        </div>
      </div>

      {/* Compact Filter Tabs */}
      <div className="bg-white rounded-lg mb-3 shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex bg-gray-50 border-b border-gray-200">
          {filters.map((filter) => {
            const count = notifications.filter((n) => {
              if (filter.key === "All") return true;
              if (filter.key === "Task Updates")
                return n.type === "subtask_updated" || n.type === "task_update";
              if (filter.key === "Comments") return n.type === "comment";
              if (filter.key === "Media Uploads")
                return n.type === "media_upload";
              return true;
            }).length;

            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeFilter === filter.key
                    ? "bg-white text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{filter.icon}</span>
                <span>{filter.label}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    activeFilter === filter.key
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg p-6 mb-3 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-blue-700">
            {filteredNotifications.length}
          </span>
          <span className="text-gray-600">
            of {notifications.length} notifications
          </span>
        </div>
      </div>

      {/* Controls and Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Controls */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="🔍 Search notifications..."
                className="flex-1 min-w-80 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setGlobalFilter("");
                  setActiveFilter("All");
                  setCurrentPage(1);
                }}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages || 1}
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[10, 15, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3">
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-5 5-5-5h5v-7H7l3-3 3 3H7v7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                {globalFilter
                  ? "Try adjusting your search terms or filters"
                  : `No notifications in ${activeFilter.toLowerCase()} category yet`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedNotifications.map((notification, index) => (
                <div
                  key={notification._id}
                  className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 shadow-md border flex items-center justify-center bg-gray-100 rounded-full text-lg group-hover:bg-blue-50">
                    {getNotificationTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="font-medium text-gray-900 truncate pr-4">
                        {notification.title}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getNotificationTypeBadge(
                            notification.type
                          )}`}
                        >
                          {notification.type?.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {notification.description}
                      </p>
                      <a
                        href={`${
                          notification.type === "task_update" ||
                          notification.type === "subtask_updated"
                            ? "/subtask/view/" + notification.related_id
                            : notification.type === "comment"
                            ? "/subtask/view/" + notification.related_id
                            : notification.type === "overdue" ||
                              notification.type === "deadline"
                            ? "/subtask/view/" + notification.related_id
                            : notification.type === "media_upload"
                            ? "/subtask/view/" + notification.related_id
                            : "#"
                        }`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                        View
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      {notification.media && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                          📎 Media attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredNotifications.length)} of{" "}
                {filteredNotifications.length} entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pageNumbers = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  );

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <button
                        key={i}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          i === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(i)}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pageNumbers;
                })()}

                <button
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotificationPage;
