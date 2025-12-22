// NotificationSettings.jsx
import React from "react";
import { useSocket } from "./contexts/SocketContext";

const NotificationSettings = () => {
  const { notificationPermission, requestNotificationPermission } = useSocket();

  const handleToggleNotifications = async () => {
    if (notificationPermission === "default") {
      await requestNotificationPermission();
    } else if (notificationPermission === "denied") {
      alert(
        "Notifications are blocked. Please enable them in your browser settings:\n\n" +
          "Chrome: Settings → Privacy and security → Site Settings → Notifications\n" +
          "Firefox: Settings → Privacy & Security → Permissions → Notifications\n" +
          "Safari: Preferences → Websites → Notifications"
      );
    }
  };

  const getStatusInfo = () => {
    switch (notificationPermission) {
      case "granted":
        return {
          status: "Enabled",
          color: "green",
          icon: "✓",
          description: "You'll receive browser notifications for updates",
        };
      case "denied":
        return {
          status: "Blocked",
          color: "red",
          icon: "✕",
          description: "Notifications are blocked in browser settings",
        };
      default:
        return {
          status: "Not Enabled",
          color: "orange",
          icon: "!",
          description: "Click to enable desktop notifications",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="notification-settings">
      <div className="notification-settings-header">
        <h3>🔔 Desktop Notifications</h3>
      </div>

      <div className="notification-settings-content">
        <div className="notification-status">
          <div className={`notification-status-indicator ${statusInfo.color}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.status}</span>
          </div>
          <p className="notification-description">{statusInfo.description}</p>
        </div>

        {notificationPermission !== "granted" && (
          <button
            onClick={handleToggleNotifications}
            className="notification-enable-btn"
          >
            {notificationPermission === "denied"
              ? "Open Browser Settings"
              : "Enable Notifications"}
          </button>
        )}

        <div className="notification-info">
          <h4>What you'll be notified about:</h4>
          <ul>
            <li>Subtask status updates</li>
            <li>New comments on your tasks</li>
            <li>Media uploads</li>
            <li>Project updates</li>
          </ul>

          <p className="notification-note">
            <strong>Note:</strong> Notifications only appear when the app is not
            in focus. In-app toast notifications always appear.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
