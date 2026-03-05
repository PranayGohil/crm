// models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    admin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: String,
        role: String
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE_SUBTASK',
            'UPDATE_SUBTASK',
            'DELETE_SUBTASK',
            'BULK_CREATE_SUBTASKS',
            'BULK_UPDATE_SUBTASKS',
            'BULK_DELETE_SUBTASKS',
            'CHANGE_SUBTASK_STATUS',
            'CHANGE_SUBTASK_PRIORITY',
            'COMPLETE_STAGE',
            'ADD_COMMENT',
            'ADD_MEDIA',
            'REMOVE_MEDIA',
            'START_TIMER',
            'STOP_TIMER'
        ]
    },
    entity: {
        type: {
            type: String,
            enum: ['subtask', 'project', 'employee', 'client'],
            default: 'subtask'
        },
        id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
        updatedFields: [String]
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    relatedTo: {
        project: {
            id: mongoose.Schema.Types.ObjectId,
            name: String
        },
        employee: {
            id: mongoose.Schema.Types.ObjectId,
            name: String
        },
        client: {
            id: mongoose.Schema.Types.ObjectId,
            name: String
        }
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ 'admin.id': 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ 'entity.id': 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ 'relatedTo.project.id': 1 });
activityLogSchema.index({ 'relatedTo.employee.id': 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;