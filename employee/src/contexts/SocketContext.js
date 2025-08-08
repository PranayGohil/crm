// SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("employeeUser"));
    const s = io(process.env.REACT_APP_API_URL);

    if (storedUser) {
      s.emit("register", storedUser._id);
    }

    setSocket(s);

    // 🔔 GLOBAL socket listeners here
    s.on("new_subtask", (notification) => {
      toast.success(`New task assigned: ${notification.title}`);
    });

    s.on("subtask_updated", (notification) => {
      toast.info(`Task updated: ${notification.title}`);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
