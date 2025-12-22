// notificationService.js
// Utility functions for browser push notifications

class NotificationService {
  constructor() {
    this.permission = Notification.permission;
  }

  /**
   * Check if browser supports notifications
   */
  isSupported() {
    return "Notification" in window;
  }

  /**
   * Request permission from user to show notifications
   */
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    if (this.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    }

    return false;
  }

  /**
   * Show a browser notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  show(title, options = {}) {
    if (!this.isSupported()) {
      console.warn("Notifications not supported");
      return null;
    }

    if (this.permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Generate unique tag if not provided to prevent overlapping
    const uniqueTag =
      options.tag ||
      `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const defaultOptions = {
      icon: "/logo192.png", // Your app icon
      badge: "/logo192.png",
      vibrate: [200, 100, 200],
      requireInteraction: true, // Changed to true - keeps notification until user closes it
      tag: uniqueTag, // Unique tag for each notification to prevent overlap
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Remove auto-close - let user dismiss manually
      // Users can close it themselves or it will stay in notification center

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }

  /**
   * Show notification with click handler
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @param {Function} onClick - Click handler
   */
  showWithAction(title, options = {}, onClick) {
    const notification = this.show(title, options);

    if (notification && onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        onClick(event);
        notification.close();
      };
    }

    return notification;
  }

  /**
   * Check current permission status
   */
  getPermission() {
    return this.permission;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
