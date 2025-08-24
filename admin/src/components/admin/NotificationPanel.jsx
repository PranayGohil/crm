import { useEffect, useState, useContext } from "react";
import axios from "axios";
import NotificationItem from "../../components/admin/NotificationItem";
import { Link } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";

const NotificationAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { notifications, setNotifications } = useSocket();

  const [activeFilter, setActiveFilter] = useState("All");
  const visibleNotifications = 5;

  const filters = [
    { key: "All", label: "All", icon: "📋" },
    { key: "Task Updates", label: "Tasks", icon: "📝" },
    { key: "Comments", label: "Comments", icon: "💬" },
    { key: "Media Uploads", label: "Media", icon: "📎" },
  ];

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const adminId = adminUser?._id;
  const receiverType = "admin";

  const filteredNotifications = notifications
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Task Updates")
        return n.type === "subtask_updated" || n.type === "task_update";
      if (activeFilter === "Comments") return n.type === "comment";
      if (activeFilter === "Due Dates")
        return n.type === "overdue" || n.type === "deadline";
      if (activeFilter === "Media Uploads") return n.type === "media_upload";
      return true;
    })
    .slice(0, visibleNotifications);

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      try {
        // 1. Fetch notifications
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification/get`,
          {
            params: {
              receiver_id: adminId,
              receiver_type: receiverType,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("employeeToken")}`,
            },
          }
        );

        setNotifications(res.data.notifications);
      } catch (error) {
        console.error("Error fetching/marking notifications:", error);
      }
    };

    if (adminId) {
      fetchAndMarkNotifications();
    }
  }, [adminId, setNotifications]);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-3 my-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <section>
        <div className="bg-white rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Notification Center
              </h1>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg mb-3 shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex bg-gray-50 border-b border-gray-200">
              {filters.map((filter) => {
                const count = notifications.filter((n) => {
                  if (filter.key === "All") return true;
                  if (filter.key === "Task Updates")
                    return (
                      n.type === "subtask_updated" || n.type === "task_update"
                    );
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          {filteredNotifications.length === 0 ? (
            <div className="d-flex justify-content-center mt-5">
              No notifications yet in this category.
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification._id}
                className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group mb-2"
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
            ))
          )}
          <Link
            to="/notifications"
            className="d-flex justify-content-center mt-3"
          >
            <button className="btn btn-outline-primary">See More</button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotificationAdmin;
