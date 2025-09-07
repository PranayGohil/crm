import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import clientRouter from "./routes/clientRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import subTaskRouter from "./routes/subTaskRoutes.js";
import statisticsRouter from "./routes/statisticsRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import designationRouter from "./routes/designationRoutes.js";
import departmentRouter from "./routes/departmentRoutes.js";

const app = express();
const port = 3001;

// create HTTP server and pass to socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend domain in production
    methods: ["GET", "POST"],
  },
});

export const emitToUser = (userId, event, data) => {
  const socketId = connectedUsers[userId];
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

const connectedUsers = {}; // Track employees

io.on("connection", (socket) => {
  socket.on("register", (employeeId) => {
    connectedUsers[employeeId] = socket.id;
    console.log(
      `Employee ${employeeId} registered with socket ID ${socket.id}`
    );
  });

  socket.on("disconnect", () => {
    for (let id in connectedUsers) {
      if (connectedUsers[id] === socket.id) {
        delete connectedUsers[id];
        break;
      }
    }
  });
});

app.set("io", io);
app.set("connectedUsers", connectedUsers);

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
app.use("/api/designation", designationRouter);
app.use("/api/department", departmentRouter);

// Start server
server.listen(port, () => console.log(`App listening on port ${port}!`));
