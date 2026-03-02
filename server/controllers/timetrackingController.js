// controllers/timeTrackingController.js
// New dedicated controller for the Time Tracking Dashboard.
// Single aggregation pipeline replaces three separate fetches + all
// client-side filtering.  Supports:
//   • Pagination (page / limit)
//   • Employee filter
//   • Time-range filter (today / week / month / custom from+to)
//   • Project name search
//   • Subtask name search

import mongoose from "mongoose";
import Project from "../models/projectModel.js";
import SubTask from "../models/subTaskModel.js";
import Employee from "../models/employeeModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — builds the date-range filter for time_logs.start_time
// ─────────────────────────────────────────────────────────────────────────────
const buildDateFilter = ({ range, from, to }) => {
    const now = new Date();

    switch (range) {
        case "today": {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setHours(23, 59, 59, 999);
            return { $gte: start, $lte: end };
        }
        case "week": {
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            return { $gte: start };
        }
        case "month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { $gte: start };
        }
        case "custom": {
            if (!from && !to) return null;
            const filter = {};
            if (from) filter.$gte = new Date(from);
            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                filter.$lte = end;
            }
            return filter;
        }
        default:
            return null; // "all" — no date restriction
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/time-tracking
//
// Query params:
//   page          (number, default 1)
//   limit         (number, default 15)  — projects per page
//   search        (string) — project name search
//   subtaskSearch (string) — subtask name search
//   employee      (string) — employee _id
//   range         (string) — all | today | week | month | custom
//   from          (ISO date string, used when range=custom)
//   to            (ISO date string, used when range=custom)
// ─────────────────────────────────────────────────────────────────────────────
export const getTimeTrackingData = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 15,
            search = "",
            subtaskSearch = "",
            employee = "",
            range = "all",
            from = "",
            to = "",
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const dateFilter = buildDateFilter({ range, from, to });

        // ── 1. Build subtask match ────────────────────────────────────────────
        // We only want subtasks that have at least one time log entry
        // (optionally within the date range and for the selected employee).
        const subtaskMatch = {
            "time_logs.0": { $exists: true }, // has at least one log
        };

        if (employee) {
            subtaskMatch.assign_to = new mongoose.Types.ObjectId(employee);
        }

        if (subtaskSearch) {
            subtaskMatch.task_name = { $regex: subtaskSearch, $options: "i" };
        }

        // ── 2. Build project match ────────────────────────────────────────────
        const projectMatch = {};
        if (search) {
            projectMatch.project_name = { $regex: search, $options: "i" };
        }

        // ── 3. Main aggregation pipeline ─────────────────────────────────────
        // Strategy:
        //   a. Match projects by name search
        //   b. $lookup subtasks with per-subtask filtering in the sub-pipeline
        //   c. Inside the $lookup, filter time_logs by date range so we only
        //      return relevant log entries (not the entire logs array)
        //   d. Drop projects with no matching subtasks after filtering
        //   e. Paginate

        const subtaskPipeline = [
            {
                $match: {
                    $expr: { $eq: ["$project_id", "$$pid"] },
                    ...subtaskMatch,
                },
            },
            // Filter time_logs array to only include entries within the date range
            {
                $addFields: {
                    time_logs: {
                        $filter: {
                            input: "$time_logs",
                            as: "log",
                            cond: {
                                $and: [
                                    { $ifNull: ["$$log.start_time", false] },
                                    { $ifNull: ["$$log.end_time", false] },
                                    ...(dateFilter
                                        ? [
                                            { $gte: ["$$log.start_time", dateFilter.$gte ?? new Date(0)] },
                                            ...(dateFilter.$lte
                                                ? [{ $lte: ["$$log.start_time", dateFilter.$lte] }]
                                                : []),
                                        ]
                                        : []),
                                ],
                            },
                        },
                    },
                },
            },
            // Drop subtasks whose time_logs became empty after filtering
            {
                $match: { "time_logs.0": { $exists: true } },
            },
            // Compute time spent (milliseconds) for each subtask
            {
                $addFields: {
                    timeSpentMs: {
                        $sum: {
                            $map: {
                                input: "$time_logs",
                                as: "log",
                                in: {
                                    $subtract: ["$$log.end_time", "$$log.start_time"],
                                },
                            },
                        },
                    },
                },
            },
            // Only send what the UI needs
            {
                $project: {
                    task_name: 1,
                    stages: 1,
                    status: 1,
                    priority: 1,
                    due_date: 1,
                    assign_to: 1,
                    time_logs: 1,
                    timeSpentMs: 1,
                    current_stage_index: 1,
                },
            },
        ];

        const pipeline = [
            { $match: projectMatch },

            {
                $lookup: {
                    from: "subtasks",
                    let: { pid: "$_id" },
                    pipeline: subtaskPipeline,
                    as: "subtasks",
                },
            },

            // Drop projects with no matching subtasks
            { $match: { "subtasks.0": { $exists: true } } },

            // Pre-compute total time for the project row (avoids doing it in JS)
            {
                $addFields: {
                    totalTimeMs: { $sum: "$subtasks.timeSpentMs" },
                    subtaskCount: { $size: "$subtasks" },
                },
            },
        ];

        // Count and data queries run in parallel
        const [countResult, projects] = await Promise.all([
            Project.aggregate([...pipeline, { $count: "total" }]),
            Project.aggregate([
                ...pipeline,
                { $sort: { totalTimeMs: -1 } }, // most-worked projects first
                { $skip: skip },
                { $limit: Number(limit) },
                {
                    $project: {
                        project_name: 1,
                        status: 1,
                        priority: 1,
                        assign_date: 1,
                        due_date: 1,
                        subtasks: 1,
                        totalTimeMs: 1,
                        subtaskCount: 1,
                    },
                },
            ]),
        ]);

        const total = countResult[0]?.total ?? 0;

        // ── 4. Compute summary across ALL matching data (not just this page) ─
        // We run a lightweight aggregation for the summary cards.
        const [summaryResult] = await Project.aggregate([
            { $match: projectMatch },
            {
                $lookup: {
                    from: "subtasks",
                    let: { pid: "$_id" },
                    pipeline: subtaskPipeline,
                    as: "subtasks",
                },
            },
            { $match: { "subtasks.0": { $exists: true } } },
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 },
                    totalSubtasks: { $sum: { $size: "$subtasks" } },
                    totalTimeMs: { $sum: { $sum: "$subtasks.timeSpentMs" } },
                },
            },
        ]);

        res.status(200).json({
            projects,
            summary: summaryResult ?? { totalProjects: 0, totalSubtasks: 0, totalTimeMs: 0 },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("getTimeTrackingData error:", error);
        res.status(500).json({ message: "Server error" });
    }
};