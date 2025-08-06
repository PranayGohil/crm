import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, employeeId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!employeeId) return;

    const newSocket = io(process.env.REACT_APP_API_URL); // e.g. http://localhost:3001
    newSocket.emit("register", employeeId);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [employeeId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
