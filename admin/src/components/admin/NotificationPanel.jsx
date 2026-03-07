import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../contexts/SocketContext";

const NotificationAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { notifications, setNotifications } = useSocket();
  const [activeFilter, setActiveFilter] = useState("All");
  const visibleCount = 5;

  const filters = [
    { key: "All", label: "All", icon: "📋" },
    { key: "Task Updates", label: "Tasks", icon: "📝" },
    { key: "Comments", label: "Comments", icon: "💬" },
    { key: "Media Uploads", label: "Media", icon: "📎" },
  ];

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const adminId = adminUser?._id;

  useEffect(() => {
    if (!adminId) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/notification/get`, {
        params: { receiver_id: adminId, receiver_type: "admin" },
        headers: { Authorization: `Bearer ${localStorage.getItem("employeeToken")}` },
      })
      .then((res) => setNotifications(res.data.notifications))
      .catch((err) => console.error(err));
  }, [adminId, setNotifications]);

  const filterFn = (key, n) => {
    if (key === "All") return true;
    if (key === "Task Updates") return n.type === "subtask_updated" || n.type === "task_update";
    if (key === "Comments") return n.type === "comment";
    if (key === "Media Uploads") return n.type === "media_upload";
    return true;
  };

  const filteredNotifications = notifications.filter((n) => filterFn(activeFilter, n)).slice(0, visibleCount);

  const getIcon = (type) => {
    const map = { subtask_updated: "📝", task_update: "📝", comment: "💬", overdue: "⏰", deadline: "⏰", media_upload: "📎" };
    return map[type] || "📋";
  };

  const getTypeBadge = (type) => {
    const map = {
      subtask_updated: "bg-blue-100 text-blue-800 border-blue-200",
      task_update: "bg-blue-100 text-blue-800 border-blue-200",
      comment: "bg-green-100 text-green-800 border-green-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
      deadline: "bg-red-100 text-red-800 border-red-200",
      media_upload: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return map[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const timeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getViewLink = (n) => `/subtask/view/${n.related_id}`;

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
        <Link
          to="/notifications"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          See All
        </Link>
      </div>

      {/* Filter tabs - scrollable on mobile */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 scrollbar-hide">
        {filters.map((f) => {
          const count = notifications.filter((n) => filterFn(f.key, n)).length;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap relative ${activeFilter === f.key
                  ? "bg-white text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {count > 0 && (
                <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-gray-50">
        {filteredNotifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n._id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-9 h-9 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center text-base border border-gray-200 transition-colors">
                {getIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                  <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{n.description}</p>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeBadge(n.type)}`}>
                    {n.type?.replace("_", " ")}
                  </span>
                  <a
                    href={getViewLink(n)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationAdmin;