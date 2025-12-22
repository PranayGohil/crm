// NotificationPermissionBanner.jsx
import React, { useState, useEffect } from "react";
import { useSocket } from "./contexts/SocketContext";

const NotificationPermissionBanner = () => {
  const { notificationPermission, requestNotificationPermission } = useSocket();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("notificationBannerDismissed");
    
    if (
      !isDismissed &&
      notificationPermission === "default" &&
      !dismissed
    ) {
      // Show banner after 3 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notificationPermission, dismissed]);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem("notificationBannerDismissed", "true");
  };

  if (!showBanner || notificationPermission !== "default") {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner-content">
        <div className="notification-banner-icon">🔔</div>
        <div className="notification-banner-text">
          <h4>Enable Desktop Notifications</h4>
          <p>
            Stay updated with real-time notifications for task updates, comments,
            and more.
          </p>
        </div>
        <div className="notification-banner-actions">
          <button
            onClick={handleEnable}
            className="notification-banner-btn primary"
          >
            Enable
          </button>
          <button
            onClick={handleDismiss}
            className="notification-banner-btn secondary"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
