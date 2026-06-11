import express from "express";
import {
  Summary,
  UpcomingDueDates,
  RecentProjects,
  getDepartmentCapacities,
} from "../controllers/statisticsController.js";
import { optionalAuth } from "../middlewares/auth.js";

const statisticsRouter = express.Router();

// Optional auth → dashboard widgets are stage-scoped when an admin token is present.
statisticsRouter.use(optionalAuth);

statisticsRouter.get("/summary", Summary);
statisticsRouter.get("/upcoming-due-dates", UpcomingDueDates);
statisticsRouter.get("/recent-projects", RecentProjects);
statisticsRouter.get("/department-capacities", getDepartmentCapacities);

export default statisticsRouter;

