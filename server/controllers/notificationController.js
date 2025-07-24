import Notification from "../models/notificationModel.js";
import { io, emitToUser } from "../utils/socket.js";

export const getAllNotifications = async (req, res) => {
  try {
    const { receiver_id, receiver_type } = req.query;
    if (!receiver_id || !receiver_type) {
      return res.status(400).json({
        success: false,
        message: "Missing receiver_id or receiver_type",
      });
    }

    const notifications = await Notification.find({
      receiver_id,
      receiver_type,
    }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    // broadcast new notification to all connected clients
    // io.emit("new_notification", notification);
    emitToUser(receiver_id, "new_notification", notification);

    io.to(`${notification.receiver_type}_${notification.receiver_id}`).emit(
      "new_notification",
      notification
    );


    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
