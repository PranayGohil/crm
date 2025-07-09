import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";

import clientRouter from "./routes/clientRoutes.js";
import employeeRouter from "./routes/employeeRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import subTaskRouter from "./routes/subTaskRoutes.js";

import fs from "fs";
import path from "path";
import statisticsRouter from "./routes/statisticsRoutes.js";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: process.env.ORIGINS,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// const uploadPath = path.join("uploads", "subtasks");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// app.use("/uploads", express.static("uploads"));
app.use("/api/client", clientRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/project", projectRouter);
app.use("/api/subtask", subTaskRouter);
app.use("/api/statistics", statisticsRouter);

app.listen(port, () => console.log(`App listening on port ${port}!`));
