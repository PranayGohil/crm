import Notification from "../models/notificationModel.js";
import { emitToUser } from "../index.js";

export const getNotifications = async (req, res) => {
  try {
    const { receiver_id, receiver_type } = req.query;
    console.log("Fetching notifications for:", receiver_id, receiver_type);
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

export const markAllNotificationAsRead = async (req, res) => {
  const { receiver_id } = req.body;
  if (!receiver_id)
    return res.status(400).json({ message: "Missing receiver_id" });

  try {
    await Notification.updateMany(
      { receiver_id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ message: "Server error" });
  }
};
