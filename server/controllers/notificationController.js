import Notification from "../models/notificationModel.js";
import { io } from "../utils/socket.js";

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    // broadcast new notification to all connected clients
    io.emit("new_notification", notification);

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
