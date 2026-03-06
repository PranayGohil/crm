// utils/activityLogger.js
import ActivityLog from "../models/activityLogModel.js";
import jwt from "jsonwebtoken";

class ActivityLogger {
    constructor(req) {
        this.req = req;
        // Don't assume req.user exists, we'll get it when needed
    }

    // Get admin info from token
    async getAdminInfo() {
        try {
            // Try to get from req.user first (if already decoded by middleware)
            if (this.req.user) {
                return {
                    id: this.req.user.id,
                    username: this.req.user.username,
                    email: this.req.user.email,
                    role: this.req.user.role
                };
            }

            // If not, try to decode from token
            const token = this.req.header("Authorization")?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Fetch full admin details from database if needed
                const Admin = (await import('../models/adminModel.js')).default;
                const admin = await Admin.findById(decoded.id).select('username email role');

                if (admin) {
                    return {
                        id: admin._id,
                        username: admin.username,
                        email: admin.email,
                        role: admin.role
                    };
                }

                // Fallback to decoded token data
                return {
                    id: decoded.id,
                    username: decoded.username || 'Unknown',
                    email: decoded.email,
                    role: decoded.role
                };
            }
        } catch (error) {
            console.error('Error getting admin info:', error);
        }

        // Return null if no admin info found
        return null;
    }

    // Get client IP address
    getIpAddress() {
        return this.req.ip ||
            this.req.connection?.remoteAddress ||
            this.req.headers['x-forwarded-for'] ||
            'Unknown';
    }

    // Get user agent
    getUserAgent() {
        return this.req.headers['user-agent'] || 'Unknown';
    }

    // Main log method
    async log(action, data) {
        try {
            // Get admin info
            const adminInfo = await this.getAdminInfo();

            if (!adminInfo) {
                console.warn('No admin info available for activity logging');
                return;
            }

            const logEntry = new ActivityLog({
                admin: {
                    id: adminInfo.id,
                    username: data.adminUsername || adminInfo.username || 'Unknown',
                    email: data.adminEmail || adminInfo.email,
                    role: adminInfo.role
                },
                action,
                entity: data.entity || { type: 'subtask' },
                changes: data.changes || {},
                metadata: {
                    ipAddress: this.getIpAddress(),
                    userAgent: this.getUserAgent(),
                    timestamp: new Date()
                },
                relatedTo: data.relatedTo || {},
                description: data.description || this.generateDescription(action, data),
                severity: data.severity || 'info'
            });

            await logEntry.save();
            return logEntry;
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw - logging should not break main functionality
        }
    }

    // Generate human-readable description
    generateDescription(action, data) {
        const descriptions = {
            'CREATE_SUBTASK': `Created new subtask "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_SUBTASK': `Updated subtask "${data.entity?.name || 'Unknown'}"`,
            'DELETE_SUBTASK': `Deleted subtask "${data.entity?.name || 'Unknown'}"`,
            'BULK_CREATE_SUBTASKS': `Bulk created ${data.metadata?.count || 0} subtasks`,
            'BULK_UPDATE_SUBTASKS': `Bulk updated ${data.metadata?.count || 0} subtasks`,
            'BULK_DELETE_SUBTASKS': `Bulk deleted ${data.metadata?.count || 0} subtasks`,
            'CHANGE_SUBTASK_STATUS': `Changed status of subtask "${data.entity?.name}" from "${data.changes?.before?.status}" to "${data.changes?.after?.status}"`,
            'CHANGE_SUBTASK_PRIORITY': `Changed priority of subtask "${data.entity?.name}" from "${data.changes?.before?.priority}" to "${data.changes?.after?.priority}"`,
            'COMPLETE_STAGE': `Completed stage "${data.metadata?.stageName}" in subtask "${data.entity?.name}"`,
            'ADD_COMMENT': `Added comment to subtask "${data.entity?.name}"`,
            'ADD_MEDIA': `Added ${data.metadata?.count || 0} media file(s) to subtask "${data.entity?.name}"`,
            'REMOVE_MEDIA': `Removed media from subtask "${data.entity?.name}"`,
            'START_TIMER': `Started timer on subtask "${data.entity?.name}"`,
            'STOP_TIMER': `Stopped timer on subtask "${data.entity?.name}"`,
            'CREATE_PROJECT': `Created new project "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_PROJECT': `Updated project "${data.entity?.name || 'Unknown'}"`,
            'DELETE_PROJECT': `Deleted project "${data.entity?.name || 'Unknown'}"`,
            'CHANGE_PROJECT_STATUS': `Changed status of project "${data.entity?.name}" from "${data.changes?.before?.status}" to "${data.changes?.after?.status}"`,
            'CHANGE_PROJECT_PRIORITY': `Changed priority of project "${data.entity?.name}" from "${data.changes?.before?.priority}" to "${data.changes?.after?.priority}"`,
            'ADD_PROJECT_CONTENT': `Added content to project "${data.entity?.name}"`,
            'BULK_UPDATE_PROJECTS': `Bulk updated ${data.metadata?.count || 0} projects`,
            'BULK_DELETE_PROJECTS': `Bulk deleted ${data.metadata?.count || 0} projects`,
            'ARCHIVE_PROJECT': `Archived project "${data.entity?.name || 'Unknown'}"`,
            'UNARCHIVE_PROJECT': `Unarchived project "${data.entity?.name || 'Unknown'}"`,
            'CREATE_EMPLOYEE': `Created new employee "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_EMPLOYEE': `Updated employee "${data.entity?.name || 'Unknown'}"`,
            'DELETE_EMPLOYEE': `Deleted employee "${data.entity?.name || 'Unknown'}"`,
            'CREATE_CLIENT': `Created new client "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_CLIENT': `Updated client "${data.entity?.name || 'Unknown'}"`,
            'DELETE_CLIENT': `Deleted client "${data.entity?.name || 'Unknown'}" along with related projects and subtasks`,
            'CREATE_DEPARTMENT': `Created new department "${data.entity?.name || 'Unknown'}"`,
            'DELETE_DEPARTMENT': `Deleted department "${data.entity?.name || 'Unknown'}"`,
            'CREATE_DESIGNATION': `Created new designation "${data.entity?.name || 'Unknown'}"`,
            'DELETE_DESIGNATION': `Deleted designation "${data.entity?.name || 'Unknown'}"`,
            'CREATE_ADMIN': `Created new admin account for "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_ADMIN': `Updated admin account for "${data.entity?.name || 'Unknown'}"`,
            'DELETE_ADMIN': `Deleted admin account for "${data.entity?.name || 'Unknown'}"`,
            'UPDATE_ADMIN_PROFILE': `Admin "${data.entity?.name || 'Unknown'}" updated their own profile`,
        };

        return descriptions[action] || `Performed ${action} on subtask`;
    }
}

export default ActivityLogger;