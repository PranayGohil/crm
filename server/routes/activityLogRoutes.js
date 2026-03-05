// routes/activityLogRoutes.js
import express from "express";
import {
    getActivityLogs,
    getSubtaskActivityLogs,
    getActivitySummary,
    exportActivityLogs
} from "../controllers/activityLogController.js";
import { verifyToken } from "../middlewares/auth.js";
import { isSuperAdmin } from "../controllers/adminController.js";

const activityLogRouter = express.Router();

// All activity log routes require authentication
activityLogRouter.use(verifyToken);

// Get all activity logs (paginated)
activityLogRouter.get("/", getActivityLogs);

// Get activity summary for dashboard
activityLogRouter.get("/summary", getActivitySummary);

// Export activity logs
activityLogRouter.get("/export", exportActivityLogs);

// Get logs for specific subtask
activityLogRouter.get("/subtask/:subtaskId", getSubtaskActivityLogs);

// Super admin only - delete old logs
activityLogRouter.delete("/cleanup", isSuperAdmin, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await ActivityLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} logs older than ${days} days`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Cleanup failed' });
    }
});

export default activityLogRouter;