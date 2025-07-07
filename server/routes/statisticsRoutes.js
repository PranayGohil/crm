import express from "express";
import { Summary, UpcomingDueDates, RecentProjects } from "../controllers/statisticsController.js";

const statisticsRouter = express.Router();

statisticsRouter.get("/summary", Summary);
statisticsRouter.get("/upcoming-due-dates", UpcomingDueDates);
statisticsRouter.get("/recent-projects", RecentProjects);

export default statisticsRouter;