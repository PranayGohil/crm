import express from "express";
import {
  getNotifications,
  markAllNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/get", getNotifications);

notificationRouter.put("/mark-all-read", markAllNotificationAsRead);

export default notificationRouter;
