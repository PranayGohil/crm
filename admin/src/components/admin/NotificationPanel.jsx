import { useEffect, useState, useContext } from "react";
import NotificationItem from "../../components/admin/NotificationItem";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Link } from "react-router-dom";

const NotificationAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { notifications, markAllAsRead } = useContext(NotificationContext);

  const [activeFilter, setActiveFilter] = useState("All");
  const visibleNotifications = 5;

  const filters = [
    "All",
    "Task Updates",
    "Comments",
    "Due Dates",
    "Media Uploads",
  ];

  const filteredNotifications = notifications
    .slice(0, visibleNotifications)
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Task Updates")
        return n.type === "subtask_update" || n.type === "task_update";
      if (activeFilter === "Comments") return n.type === "comment";
      if (activeFilter === "Due Dates")
        return n.type === "overdue" || n.type === "deadline";
      if (activeFilter === "Media Uploads") return n.type === "media_upload";
      return true;
    });

  useEffect(() => {
    markAllAsRead();
  }, []);

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
