import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";

import { setupSocket } from "./utils/socket.js"; // import socket setup

import clientRouter from "./routes/clientRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import subTaskRouter from "./routes/subTaskRoutes.js";
import statisticsRouter from "./routes/statisticsRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();
const port = 3001;

// create HTTP server and pass to socket
const server = http.createServer(app);
setupSocket(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/admin", adminRouter);
app.use("/api/client", clientRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/project", projectRouter);
app.use("/api/subtask", subTaskRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/notification", notificationRouter);

// Start server
server.listen(port, () => console.log(`App listening on port ${port}!`));
