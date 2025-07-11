import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    type: String,
    related_id: String,
    icon: String,
    time: Date,
    media: [String],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
