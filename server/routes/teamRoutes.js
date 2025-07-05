import express from "express";
import {
  getTeams,
  getTeam,
  addTeam,
  deleteTeam,
  updateTeam,
} from "../controllers/teamController.js";

const teamRouter = express.Router();

teamRouter.get("/get-all", getTeams);
teamRouter.get("/get/:id", getTeam);
teamRouter.post("/add", addTeam);
teamRouter.delete("/delete/:id", deleteTeam);
teamRouter.put("/update/:id", updateTeam);

export default teamRouter;
