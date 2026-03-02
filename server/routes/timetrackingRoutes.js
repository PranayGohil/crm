import express from "express";

import {
    getTimeTrackingData,
} from "../controllers/timetrackingController.js";

const timetrackingRouter = express.Router();

timetrackingRouter.get("/", getTimeTrackingData);

export default timetrackingRouter;