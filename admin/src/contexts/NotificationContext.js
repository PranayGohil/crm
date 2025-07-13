// import React, { createContext, useState, useEffect } from "react";
// import { io } from "socket.io-client";

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children, userId }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // create socket instance
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     if (!userId) return;

//     const newSocket = io(process.env.REACT_APP_API_URL, {
//       transports: ["websocket"],
//     });
//     setSocket(newSocket);

//     // register user
//     newSocket.emit("register", userId);

//     // receive new notifications
//     newSocket.on("new_notification", (notification) => {
//       setNotifications((prev) => [notification, ...prev]);
//       setUnreadCount((count) => count + 1);
//     });

//     return () => newSocket.disconnect();
//   }, [userId]);

//   const markAllAsRead = () => setUnreadCount(0);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount,
//         markAllAsRead,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification/get-all`
        );
        const all = res.data.notifications || [];
        setNotifications(all);
        setUnreadCount(all.filter((n) => !n.read).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });

    newSocket.on("new_notification", (notification) => {
      setNotifications((prev = []) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => newSocket.disconnect();
  }, []);

  const markAllAsRead = () => setUnreadCount(0);

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
