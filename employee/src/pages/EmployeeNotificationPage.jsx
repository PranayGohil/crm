import React, { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import NotificationItem from "../components/NotificationItem";

const EmployeeNotificationPage = () => {
  const { notifications, setNotifications } = useSocket();
  const [filter, setFilter] = useState("all");

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

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="employee-notification-page">
      {/* Filter buttons here */}
      <div className="not-tasks-information">
        {filteredNotifications.map((item, i) => (
          <NotificationItem
            key={i}
            icon={item.icon}
            title={item.title}
            description={item.description}
            linkText="View"
            time={new Date(item.createdAt).toLocaleString()}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeNotificationPage;
