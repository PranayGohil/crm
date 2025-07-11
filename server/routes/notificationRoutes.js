import express from "express";
import {
  getAllNotifications,
  addNotification,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/get-all", getAllNotifications);

notificationRouter.post("/create", addNotification);

export default notificationRouter;
