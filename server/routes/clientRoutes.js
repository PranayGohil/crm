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
  getClientEarningsReport
} from "../controllers/clientController.js";

const clientRouter = express.Router();

clientRouter.get("/get-all", getClients);
clientRouter.get("/get/:id", getClientInfo);
clientRouter.get("/get-username/:username", getClientByUsername);
clientRouter.post("/add", addClient);
clientRouter.post("/login", loginClient);
clientRouter.delete("/delete/:id", deleteClient);
clientRouter.put("/update/:id", updateClient);
clientRouter.put("/update-username/:username", updateClientByUsername);
clientRouter.put("/toggle-status/:id", toggleClientStatus);

clientRouter.get("/tasks/:id", getClientTasks);
clientRouter.get("/projects/:username", getClientProjectsWithUsername);

clientRouter.get("/with-subtasks", getClientsWithSubtasks);
clientRouter.get("/earnings-report/:id", getClientEarningsReport);

export default clientRouter;
