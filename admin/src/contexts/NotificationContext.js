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

  const fetchNotifications = async () => {
    if (!user) return;
    console.log("Fetching notifications for user:", user._id);
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
      if (all.length != unreadCount) {
        setUnreadCount(all.length);
        console.log("🔥 Showing notification:", all.length, " - ", unreadCount);
        toast.info("📢 New notification!");
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };
  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Setup socket for real-time
  useEffect(() => {
    if (!user) return;
    console.log("Setting up socket for user:", user._id);
    const newSocket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    // Register this user so backend knows where to send
    newSocket.emit("register", user._id);

    // Listen for incoming notifications
    newSocket.on("new_notification", (notification) => {
      console.log("Received notification:", notification);
      if (notification.receiver_id === user._id) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((c) => c + 1);

        console.log("🔥 Showing notification:", notification);
        // toast.info(
        //   notification.title ||
        //     notification.description ||
        //     "📢 New notification!"
        // );
      }
    });

    setSocket(newSocket);

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
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
