// Admin Panel > SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import axios from "axios";
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
  const notificationSound = new Audio("/sounds/notification.wav");
  const canPlaySound = useRef(false);

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
    // console.log("🎧 Setting up audio unlock listener...");

    const unlockAudio = () => {
      // console.log("🖱️ Click detected - attempting to unlock audio...");
      // console.log("🔍 Audio state before unlock:", {
      //   paused: notificationSound.paused,
      //   currentTime: notificationSound.currentTime,
      //   readyState: notificationSound.readyState,
      //   src: notificationSound.src,
      // });

      notificationSound
        .play()
        .then(() => {
          // console.log("✅ Audio unlocked successfully!");
          notificationSound.pause();
          notificationSound.currentTime = 0;
          canPlaySound.current = true;
          // console.log("🔓 canPlaySound set to:", canPlaySound.current);
        })
        .catch((err) => {
          console.warn("❌ Audio unlock failed:", err.message);
          console.log("🔍 Error name:", err.name);
        });

      window.removeEventListener("click", unlockAudio);
      // console.log("🗑️ Unlock listener removed after first click");
    };

    window.addEventListener("click", unlockAudio);
    // console.log("👂 Unlock listener attached to window");

    return () => {
      // console.log("🧹 Cleaning up unlock listener (useEffect cleanup)");
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  const playNotificationSound = () => {
    if (!canPlaySound.current) {
      console.warn("🚫 Sound blocked - audio not unlocked yet (user hasn't clicked anything)");
      return;
    }

    notificationSound.currentTime = 0;
    notificationSound
      .play()
      .then(() => {
        // console.log("✅ Sound played successfully!");
      })
      .catch((err) => {
        console.warn("❌ Sound play failed:", err.message);
        console.log("🔍 Error name:", err.name);
        // If it failed, maybe unlock was lost - reset flag
        if (err.name === "NotAllowedError") {
          console.warn("🔒 NotAllowedError - resetting canPlaySound to false");
          canPlaySound.current = false;
        }
      });
  };

  useEffect(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.data.admin) {
        console.error("Failed to fetch admin profile:", response.data);
        navigate("/login");
        return;
      }
      const user = response.data.admin;
      // console.log("Fetched admin profile:", user);

      const s = io(process.env.REACT_APP_API_URL, {
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      });
      setSocket(s);

      if (user) {
        s.emit("register", user._id);
        // console.log("Registered socket for admin:", user.username);
      }

      // Helper function to show both toast and browser notification
      const showNotification = (notification, type = "info") => {
        // console.log("📩 showNotification triggered:", {
        //   title: notification.title,
        //   type: notification.type,
        //   related_id: notification.related_id,
        // });

        // console.log("🔊 About to call playNotificationSound...");
        playNotificationSound();

        // Show toast notification
        toast[type](`${notification.title}`);

        // Show browser notification (only if page is not focused)
        if (document.hidden && notificationPermission === "granted") {
          // Generate unique tag for each notification to prevent overlap
          const uniqueTag = `${notification.type}-${notification.related_id || Date.now()
            }-${Math.random().toString(36).substr(2, 9)}`;

          notificationService.showWithAction(
            notification.title,
            {
              body: notification.description || "",
              icon: notification.icon || "/SVG/diamond-rich_teal.svg",
              tag: uniqueTag, // Unique tag to prevent overlap
              requireInteraction: true, // Keep notification until user closes it
              data: {
                url: window.location.origin,
                notificationId: notification._id,
                relatedId: notification.related_id,
                type: notification.type,
              },
            },
            () => {
              window.focus();
              if (
                notification.type === "subtask_updated" &&
                notification.related_id
              ) {
                navigate(`/subtask/view/${notification.related_id}`);
                // console.log("Navigate to subtask:", notification.related_id);
              }
            }
          );
        }

        setNotifications((prev) => [notification, ...prev]);
      };

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
        showNotification(notification, "success");
      });

      return () => {
        s.disconnect();
      };
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      navigate("/login");
    }
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
