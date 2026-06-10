import express from "express";
import {
  addClient,
  loginClient,
  getClients,
  getClientInfo,
  getClientByUsername,
  deleteClient,
  updateClient,
  updateClientByUsername,
  toggleClientStatus,
  getClientTasks,
  getClientProjectsWithUsername,
  getClientsWithSubtasks,
  getClientEarningsReport,
  searchClients
} from "../controllers/clientController.js";

import { optionalAuth } from "../middlewares/auth.js";
import { protectAdmin, requireMaulshree } from "../middlewares/adminAuth.js";

const clientRouter = express.Router();

// Public auth endpoint (no token).
clientRouter.post("/login", loginClient);

// Admin-only writes: hard auth + stage authorization.
clientRouter.post("/add", protectAdmin, requireMaulshree, addClient);
clientRouter.delete("/delete/:id", protectAdmin, requireMaulshree, deleteClient);
clientRouter.put("/update/:id", protectAdmin, requireMaulshree, updateClient);
clientRouter.put("/update-username/:username", protectAdmin, requireMaulshree, updateClientByUsername);
clientRouter.put("/toggle-status/:id", protectAdmin, requireMaulshree, toggleClientStatus);

// Shared reads: optional auth → stage-scoped when an admin token is present,
// otherwise unscoped (preserves client/employee portal behavior).
clientRouter.use(optionalAuth);
clientRouter.get("/search", searchClients);
clientRouter.get("/get-all", getClients);
clientRouter.get("/get/:id", getClientInfo);
clientRouter.get("/get-username/:username", getClientByUsername);
clientRouter.get("/tasks/:id", getClientTasks);
clientRouter.get("/projects/:username", getClientProjectsWithUsername);
clientRouter.get("/with-subtasks", getClientsWithSubtasks);
clientRouter.get("/earnings-report/:id", getClientEarningsReport);

export default clientRouter;
