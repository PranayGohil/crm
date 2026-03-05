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
        if (projectId) query['relatedTo.project.id'] = projectId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { 'admin.username': { $regex: search, $options: 'i' } },
                { 'entity.name': { $regex: search, $options: 'i' } }
            ];
        }

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

        const logs = await ActivityLog.find({ 'entity.id': subtaskId })
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
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            summary,
            topAdmins
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
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }

        const logs = await ActivityLog.find(query).sort({ createdAt: -1 });

        if (format === 'csv') {
            // Convert to CSV
            const csv = convertToCSV(logs);
            res.header('Content-Type', 'text/csv');
            res.attachment(`activity-logs-${new Date().toISOString()}.csv`);
            return res.send(csv);
        }

        // Default JSON format
        res.json({
            success: true,
            logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error exporting activity logs:', error);
        res.status(500).json({ success: false, message: 'Failed to export activity logs' });
    }
};

// Helper function to convert logs to CSV
const convertToCSV = (logs) => {
    const headers = ['Date', 'Admin', 'Action', 'Entity', 'Description', 'IP Address'];
    const rows = logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.admin.username,
        log.action,
        `${log.entity.type}: ${log.entity.name || 'N/A'}`,
        log.description,
        log.metadata.ipAddress
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
};