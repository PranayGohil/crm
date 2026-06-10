import express from "express";

import {
    getTimeTrackingData,
} from "../controllers/timetrackingController.js";
import { optionalAuth } from "../middlewares/auth.js";

const timetrackingRouter = express.Router();

timetrackingRouter.get("/", optionalAuth, getTimeTrackingData);

export default timetrackingRouter;