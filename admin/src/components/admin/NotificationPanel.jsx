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
    "All",
    "Task Updates",
    "Comments",
    "Due Dates",
    "Media Uploads",
  ];

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const adminId = adminUser?._id;
  const receiverType = "admin";

  const filteredNotifications = notifications
    .slice(0, visibleNotifications)
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Task Updates")
        return n.type === "subtask_updated" || n.type === "task_update";
      if (activeFilter === "Comments") return n.type === "comment";
      if (activeFilter === "Due Dates")
        return n.type === "overdue" || n.type === "deadline";
      if (activeFilter === "Media Uploads") return n.type === "media_upload";
      return true;
    });

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="notification-admin">
      <section className="not-notification-header">
        <div className="not-notification-header-txt">
          <span>Notification Center</span>
        </div>
        <div className="not-header-navbar">
          {filters.map((filter) => (
            <a
              key={filter}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveFilter(filter);
              }}
              className={`not-inner-nav ${
                activeFilter === filter ? "active-link" : ""
              }`}
            >
              {filter}
            </a>
          ))}
        </div>
      </section>

      <section className="not-sec-2">
        <div className="not-tasks-information">
          {filteredNotifications.length === 0 ? (
            <div className="d-flex justify-content-center mt-5">
              No notifications yet in this category.
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <NotificationItem
                key={n._id}
                icon={n.icon}
                title={n.title}
                description={n.description}
                linkText="View"
                linkHref={`${
                  n.type === "task_update" || n.type === "subtask_update"
                    ? "/subtask/view/" + n.related_id
                    : n.type === "comment"
                    ? "/task/view/" + n.related_id
                    : n.type === "overdue" || n.type === "deadline"
                    ? "/task/view/" + n.related_id
                    : n.type === "media_upload"
                    ? "/task/view/" + n.related_id
                    : "#"
                }`}
                time={new Date(n.createdAt).toLocaleString()}
                media={n.media}
              />
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
