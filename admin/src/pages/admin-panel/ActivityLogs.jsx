// src/pages/admin/ActivityLogs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { FaFilter, FaDownload, FaEye, FaHistory } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ActivityLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        action: "",
        adminId: "",
        search: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const actionTypes = [
        { value: "", label: "All Actions" },
        { value: "CREATE_SUBTASK", label: "Create Subtask" },
        { value: "UPDATE_SUBTASK", label: "Update Subtask" },
        { value: "DELETE_SUBTASK", label: "Delete Subtask" },
        { value: "BULK_CREATE_SUBTASKS", label: "Bulk Create" },
        { value: "BULK_UPDATE_SUBTASKS", label: "Bulk Update" },
        { value: "BULK_DELETE_SUBTASKS", label: "Bulk Delete" },
        { value: "CHANGE_SUBTASK_STATUS", label: "Change Status" },
        { value: "CHANGE_SUBTASK_PRIORITY", label: "Change Priority" },
        { value: "ADD_COMMENT", label: "Add Comment" },
        { value: "ADD_MEDIA", label: "Add Media" },
        { value: "REMOVE_MEDIA", label: "Remove Media" }
    ];

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
                ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
                ...(filters.action && { action: filters.action }),
                ...(filters.adminId && { adminId: filters.adminId }),
                ...(filters.search && { search: filters.search })
            });

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/activity-logs?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setLogs(res.data.logs);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format = 'csv') => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                format,
                ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
                ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
                ...(filters.action && { action: filters.action })
            });

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/activity-logs/export?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity-logs-${new Date().toISOString()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting logs:", error);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-100';
        if (action.includes('UPDATE') || action.includes('CHANGE')) return 'text-blue-600 bg-blue-100';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-100';
        if (action.includes('BULK')) return 'text-purple-600 bg-purple-100';
        return 'text-gray-600 bg-gray-100';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) return <LoadingOverlay />;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <FaHistory className="text-2xl text-blue-600" />
                    <h1 className="text-2xl font-bold">Admin Activity Logs</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <FaFilter />
                        Filters
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <FaDownload />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <DatePicker
                                selected={filters.startDate}
                                onChange={(date) => setFilters({ ...filters, startDate: date })}
                                className="w-full p-2 border rounded"
                                placeholderText="Select start date"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <DatePicker
                                selected={filters.endDate}
                                onChange={(date) => setFilters({ ...filters, endDate: date })}
                                className="w-full p-2 border rounded"
                                placeholderText="Select end date"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Action Type</label>
                            <select
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                {actionTypes.map(action => (
                                    <option key={action.value} value={action.value}>
                                        {action.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Search</label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search by description, admin, entity..."
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => {
                                setFilters({
                                    startDate: null,
                                    endDate: null,
                                    action: "",
                                    adminId: "",
                                    search: ""
                                });
                                setPagination({ ...pagination, page: 1 });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Entity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(log.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {log.admin.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {log.admin.role}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entity.name || log.entity.id || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {log.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span>{' '}
                                of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Activity Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Admin</label>
                                <p className="mt-1">{selectedLog.admin.username} ({selectedLog.admin.role})</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Action</label>
                                <p className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(selectedLog.action)}`}>
                                        {selectedLog.action.replace(/_/g, ' ')}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1">{selectedLog.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Timestamp</label>
                                <p className="mt-1">{formatDate(selectedLog.createdAt)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">IP Address</label>
                                <p className="mt-1">{selectedLog.metadata?.ipAddress || 'N/A'}</p>
                            </div>

                            {selectedLog.changes?.before && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Changes</label>
                                    <div className="mt-1 bg-gray-50 p-3 rounded">
                                        <p className="text-sm">
                                            <span className="font-medium">Before:</span>{' '}
                                            {JSON.stringify(selectedLog.changes.before, null, 2)}
                                        </p>
                                        <p className="text-sm mt-2">
                                            <span className="font-medium">After:</span>{' '}
                                            {JSON.stringify(selectedLog.changes.after, null, 2)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedLog.relatedTo?.project && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Related Project</label>
                                    <p className="mt-1">{selectedLog.relatedTo.project.name}</p>
                                </div>
                            )}

                            {selectedLog.relatedTo?.employee && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Related Employee</label>
                                    <p className="mt-1">{selectedLog.relatedTo.employee.name}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;