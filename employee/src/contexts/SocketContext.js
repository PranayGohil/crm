// SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import notificationService from "../notificationService";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    notificationService.getPermission()
  );

  // Request notification permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      if (notificationService.isSupported()) {
        const granted = await notificationService.requestPermission();
        setNotificationPermission(
          granted ? "granted" : notificationService.getPermission()
        );
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("employeeUser"));
    const s = io(process.env.REACT_APP_API_URL);
    setSocket(s);

    if (storedUser) {
      s.emit("register", storedUser._id);
    }

    // Helper function to show both toast and browser notification
    const showNotification = (notification, type = "info") => {
      // Show toast notification
      toast[type](`${notification.title}`);

      // Show browser notification (only if page is not focused)
      if (document.hidden && notificationPermission === "granted") {
        notificationService.showWithAction(
          notification.title,
          {
            body: notification.description || "",
            icon: notification.icon || "/SVG/diamond-rich_teal.svg",
            tag: notification.related_id || `notification-${Date.now()}`,
            data: {
              url: window.location.origin,
              notificationId: notification._id,
              relatedId: notification.related_id,
              type: notification.type,
            },
          },
          () => {
            // When user clicks the notification, focus window and navigate if needed
            window.focus();

            // Optional: Navigate to specific page based on notification type
            if (
              notification.type === "subtask_updated" &&
              notification.related_id
            ) {
              // You can use react-router navigation here
              navigate(`/subtask/view/${notification.related_id}`);
              console.log("Navigate to subtask:", notification.related_id);
            }
          }
        );
      }

      // Add to notifications state
      setNotifications((prev) => [notification, ...prev]);
    };

    // Listen for new task
    s.on("new_subtask", (notification) => {
      showNotification(notification, "success");
    });

    // Listen for updated task
    s.on("subtask_updated", (notification) => {
      showNotification(notification, "info");
    });

    // Listen for new comment
    s.on("comment", (notification) => {
      showNotification(notification, "info");
    });

    // Listen for new media upload
    s.on("media_upload", (notification) => {
      showNotification(notification, "info");
    });

    return () => {
      s.disconnect();
    };
  }, [notificationPermission]);

  // Function to manually request permission
  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(
      granted ? "granted" : notificationService.getPermission()
    );
    return granted;
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        notificationPermission,
        requestNotificationPermission,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
