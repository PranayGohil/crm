import express from "express";
import {
  getAllNotifications,
  addNotification,
  markAllNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/get-all", getAllNotifications);

notificationRouter.post("/create", addNotification);

notificationRouter.post("/mark-all-read", markAllNotificationAsRead);

export default notificationRouter;
