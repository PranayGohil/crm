import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import NotificationItem from "../components/NotificationItem";

const EmployeeNotificationPage = () => {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useSocket();
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    "All",
    "Task Updates",
    "Comments",
    // "Due Dates",
    "Media Uploads",
  ];

  const employeeUser = JSON.parse(localStorage.getItem("employeeUser"));
  const employeeId = employeeUser?._id;
  const receiverType = "employee";

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
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
      }
    };

    if (employeeId) {
      fetchAndMarkNotifications();
    }
  }, [employeeId, setNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Task Updates")
      return n.type === "subtask_updated" || n.type === "task_update";
    if (activeFilter === "Comments") return n.type === "comment";
    if (activeFilter === "Due Dates")
      return n.type === "overdue" || n.type === "deadline";
    if (activeFilter === "Media Uploads") return n.type === "media_upload";
    return true;
  });

  return (
    <div className="notification-admin">
      <section className="not-notification-header">
        <div className="anp-header-inner">
          <div className="anp-heading-main">
            <div
              className="anp-back-btn"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src="/SVG/arrow-pc.svg"
                alt="back"
                className="mx-2"
                style={{ scale: "1.3" }}
              />
            </div>
            <div className="head-menu">
              <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                Notification Center{" "}
              </h1>
            </div>
          </div>
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
                  n.type === "task_update" || n.type === "subtask_updated"
                    ? "/subtask/view/" + n.related_id
                    : n.type === "comment"
                    ? "/subtask/view/" + n.related_id
                    : n.type === "overdue" || n.type === "deadline"
                    ? "/subtask/view/" + n.related_id
                    : n.type === "media_upload"
                    ? "/subtask/view/" + n.related_id
                    : "#"
                }`}
                time={new Date(n.createdAt).toLocaleString()}
                media={n.media}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployeeNotificationPage;
