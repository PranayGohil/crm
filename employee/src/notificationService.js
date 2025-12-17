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

    const defaultOptions = {
      icon: "/SVG/diamond-rich_teal.svg", // Your app icon
      badge: "/SVG/diamond-rich_teal.svg",
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Auto close after 5 seconds if not clicked
      setTimeout(() => {
        notification.close();
      }, 5000);

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
