import express from "express";
import {
  getNotifications,
  addNotification,
  markAllNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/get", getNotifications);

notificationRouter.post("/create", addNotification);

notificationRouter.put("/mark-all-read", markAllNotificationAsRead);

export default notificationRouter;
