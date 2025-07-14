import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  icon: String,
  related_id: String,
  receiver_id: {
    type: String,
    required: true,
  },
  receiver_type: {
    type: String,
    enum: ["admin", "employee", "client"],
    required: true,
  },
  created_by: { type: mongoose.Schema.Types.ObjectId },
  created_by_role: String,
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
