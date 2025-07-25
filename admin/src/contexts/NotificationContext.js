import React, { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

// Create context
export const NotificationContext = createContext();

// Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const user = {
    _id: "admin",
    role: "admin",
  };

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification/get-all`,
          {
            params: {
              receiver_id: user._id,
              receiver_type: user.role,
            },
          }
        );
        const all = res.data.notifications || [];
        setNotifications(all);
        setUnreadCount(all.filter((n) => !n.read).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Setup socket for real-time
  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });

    // Register this user so backend knows where to send
    newSocket.emit("register", {
      userId: user._id,
      userRole: user.role,
    });

    // Listen for incoming notifications
    newSocket.on("new_notification", (notification) => {
      // ✅ Only show if notification is meant for this user
      if (
        notification.receiver_id === user._id &&
        notification.receiver_type === user.role
      ) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((c) => c + 1);

        console.log("🔥 Showing notification:", notification);
        toast.info(
          notification.title ||
            notification.description ||
            "📢 New notification!"
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Mark all as read (update UI only)
  const markAllAsRead = () => {
    setUnreadCount(0);
    // optional: also tell backend to mark them as read
    // axios.post('/api/notification/mark-all-read', { receiver_id: user._id });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
