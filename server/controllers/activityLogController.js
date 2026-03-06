// controllers/activityLogController.js
import ActivityLog from "../models/activityLogModel.js";

// Get all activity logs (with pagination and filters)
export const getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            adminId,
            action,
            entityId,
            entityType,
            severity,
            projectId,
            startDate,
            endDate,
            search
        } = req.query;

        const query = {};

        // Filters
        if (adminId) query['admin.id'] = adminId;
        if (action) query.action = action;
        if (entityId) query['entity.id'] = entityId;
        if (entityType) query['entity.type'] = entityType;
        if (severity) query.severity = severity;
        if (projectId) query['relatedTo.project.id'] = projectId;

        // Date range filter - FIXED: Include end date properly
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Search filter
        if (search && search.trim() !== '') {
            query.$or = [
                { description: { $regex: search.trim(), $options: 'i' } },
                { 'admin.username': { $regex: search.trim(), $options: 'i' } },
                { 'entity.name': { $regex: search.trim(), $options: 'i' } },
                { action: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        console.log('Query:', JSON.stringify(query, null, 2)); // For debugging

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            success: true,
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
};

// Get activity logs for a specific subtask
export const getSubtaskActivityLogs = async (req, res) => {
    try {
        const { subtaskId } = req.params;

        const logs = await ActivityLog.find({
            'entity.id': subtaskId,
            'entity.type': 'subtask'
        })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Error fetching subtask activity logs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
};

// Get activity summary for dashboard
export const getActivitySummary = async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        startDate.setHours(0, 0, 0, 0);

        const summary = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        action: '$action',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    actions: {
                        $push: {
                            action: '$_id.action',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Get severity counts
        const severityCounts = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get top admins by activity
        const topAdmins = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$admin.id',
                    username: { $first: '$admin.username' },
                    email: { $first: '$admin.email' },
                    role: { $first: '$admin.role' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get entity type distribution
        const entityDistribution = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$entity.type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            summary,
            severityCounts,
            topAdmins,
            entityDistribution
        });
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity summary' });
    }
};

// Export logs for reporting
export const exportActivityLogs = async (req, res) => {
    try {
        const { format = 'json', ...filters } = req.query;

        const query = {};

        // Apply filters (similar to getActivityLogs)
        if (filters.adminId) query['admin.id'] = filters.adminId;
        if (filters.action) query.action = filters.action;
        if (filters.entityType) query['entity.type'] = filters.entityType;
        if (filters.severity) query.severity = filters.severity;

        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const logs = await ActivityLog.find(query).sort({ createdAt: -1 });

        if (format === 'csv') {
            // Convert to CSV with more columns
            const csv = convertToCSV(logs);
            res.header('Content-Type', 'text/csv');
            res.attachment(`activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
            return res.send(csv);
        }

        // Default JSON format
        res.json({
            success: true,
            logs,
            count: logs.length,
            exportDate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error exporting activity logs:', error);
        res.status(500).json({ success: false, message: 'Failed to export activity logs' });
    }
};

// Helper function to convert logs to CSV
const convertToCSV = (logs) => {
    const headers = [
        'Date',
        'Time',
        'Admin',
        'Admin Role',
        'Action',
        'Entity Type',
        'Entity Name',
        'Description',
        'Severity',
        'Related Project',
        'Related Employee',
        'Related Client'
    ];

    const rows = logs.map(log => {
        const date = new Date(log.createdAt);
        const dateStr = date.toLocaleDateString('en-US');
        const timeStr = date.toLocaleTimeString('en-US');

        return [
            dateStr,
            timeStr,
            log.admin.username,
            log.admin.role || 'admin',
            log.action,
            log.entity.type || 'N/A',
            log.entity.name || 'N/A',
            log.description.replace(/,/g, ';'), // Remove commas to avoid CSV issues
            log.severity || 'info',
            log.relatedTo?.project?.name || 'N/A',
            log.relatedTo?.employee?.name || 'N/A',
            log.relatedTo?.client?.name || 'N/A'
        ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Get distinct action types for filter dropdown
export const getActionTypes = async (req, res) => {
    try {
        const actions = await ActivityLog.distinct('action');
        res.json({
            success: true,
            actions: actions.sort()
        });
    } catch (error) {
        console.error('Error fetching action types:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch action types' });
    }
};

// Get logs by date range with grouping
export const getLogsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        let groupFormat;
        if (groupBy === 'hour') {
            groupFormat = '%Y-%m-%d %H:00';
        } else if (groupBy === 'day') {
            groupFormat = '%Y-%m-%d';
        } else if (groupBy === 'month') {
            groupFormat = '%Y-%m';
        } else {
            groupFormat = '%Y-%m-%d';
        }

        const logs = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        period: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                        action: '$action',
                        severity: '$severity'
                    },
                    count: { $sum: 1 },
                    logs: { $push: '$$ROOT' }
                }
            },
            {
                $group: {
                    _id: '$_id.period',
                    actions: {
                        $push: {
                            action: '$_id.action',
                            severity: '$_id.severity',
                            count: '$count'
                        }
                    },
                    totalCount: { $sum: '$count' },
                    sampleLogs: { $first: '$logs' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            startDate: start,
            endDate: end,
            groupBy,
            logs
        });
    } catch (error) {
        console.error('Error fetching logs by date range:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch logs' });
    }
};

// Delete old logs (admin only)
export const cleanupOldLogs = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        cutoffDate.setHours(0, 0, 0, 0);

        const result = await ActivityLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} logs older than ${days} days`,
            deletedCount: result.deletedCount,
            cutoffDate
        });
    } catch (error) {
        console.error('Error cleaning up logs:', error);
        res.status(500).json({ success: false, message: 'Failed to clean up logs' });
    }
};