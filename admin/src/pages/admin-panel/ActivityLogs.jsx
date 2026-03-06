// src/pages/admin/ActivityLogs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import {
    FaFilter,
    FaDownload,
    FaEye,
    FaHistory,
    FaTimes,
    FaCalendarAlt,
    FaUserShield,
    FaExclamationTriangle,
    FaInfoCircle,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaFileCsv,
    FaSync,
    FaTrash
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ActivityLogs = () => {
    const { user, isSuperAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        action: "",
        adminId: "",
        entityType: "",
        severity: "",
        search: ""
    });
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({
        totalToday: 0,
        totalWeek: 0,
        criticalCount: 0,
        warningCount: 0
    });
    const [dateRangePreset, setDateRangePreset] = useState("custom");

    // Grouped action types by category
    const actionCategories = {
        "Subtask Actions": [
            { value: "CREATE_SUBTASK", label: "Create Subtask" },
            { value: "UPDATE_SUBTASK", label: "Update Subtask" },
            { value: "DELETE_SUBTASK", label: "Delete Subtask" },
            { value: "BULK_CREATE_SUBTASKS", label: "Bulk Create Subtasks" },
            { value: "BULK_UPDATE_SUBTASKS", label: "Bulk Update Subtasks" },
            { value: "BULK_DELETE_SUBTASKS", label: "Bulk Delete Subtasks" },
            { value: "CHANGE_SUBTASK_STATUS", label: "Change Status" },
            { value: "CHANGE_SUBTASK_PRIORITY", label: "Change Priority" },
            { value: "COMPLETE_STAGE", label: "Complete Stage" },
            { value: "ADD_COMMENT", label: "Add Comment" },
            { value: "ADD_MEDIA", label: "Add Media" },
            { value: "REMOVE_MEDIA", label: "Remove Media" },
            { value: "START_TIMER", label: "Start Timer" },
            { value: "STOP_TIMER", label: "Stop Timer" }
        ],
        "Project Actions": [
            { value: "CREATE_PROJECT", label: "Create Project" },
            { value: "UPDATE_PROJECT", label: "Update Project" },
            { value: "DELETE_PROJECT", label: "Delete Project" },
            { value: "CHANGE_PROJECT_STATUS", label: "Change Project Status" },
            { value: "CHANGE_PROJECT_PRIORITY", label: "Change Project Priority" },
            { value: "ADD_PROJECT_CONTENT", label: "Add Project Content" },
            { value: "BULK_UPDATE_PROJECTS", label: "Bulk Update Projects" },
            { value: "BULK_DELETE_PROJECTS", label: "Bulk Delete Projects" },
            { value: "ARCHIVE_PROJECT", label: "Archive Project" },
            { value: "UNARCHIVE_PROJECT", label: "Unarchive Project" }
        ],
        "Employee Actions": [
            { value: "CREATE_EMPLOYEE", label: "Create Employee" },
            { value: "UPDATE_EMPLOYEE", label: "Update Employee" },
            { value: "DELETE_EMPLOYEE", label: "Delete Employee" }
        ],
        "Client Actions": [
            { value: "CREATE_CLIENT", label: "Create Client" },
            { value: "UPDATE_CLIENT", label: "Update Client" },
            { value: "DELETE_CLIENT", label: "Delete Client" }
        ],
        "Department & Designation": [
            { value: "CREATE_DEPARTMENT", label: "Create Department" },
            { value: "UPDATE_DEPARTMENT", label: "Update Department" },
            { value: "DELETE_DEPARTMENT", label: "Delete Department" },
            { value: "CREATE_DESIGNATION", label: "Create Designation" },
            { value: "UPDATE_DESIGNATION", label: "Update Designation" },
            { value: "DELETE_DESIGNATION", label: "Delete Designation" }
        ],
        "Admin Actions": [
            { value: "CREATE_ADMIN", label: "Create Admin" },
            { value: "UPDATE_ADMIN", label: "Update Admin" },
            { value: "DELETE_ADMIN", label: "Delete Admin" },
            { value: "UPDATE_ADMIN_PROFILE", label: "Update Admin Profile" }
        ]
    };

    const entityTypes = [
        { value: "", label: "All Entities" },
        { value: "subtask", label: "Subtask" },
        { value: "project", label: "Project" },
        { value: "employee", label: "Employee" },
        { value: "client", label: "Client" },
        { value: "department", label: "Department" },
        { value: "designation", label: "Designation" },
        { value: "admin", label: "Admin" }
    ];

    const severityLevels = [
        { value: "", label: "All Severities" },
        { value: "info", label: "Info", color: "blue" },
        { value: "warning", label: "Warning", color: "yellow" },
        { value: "critical", label: "Critical", color: "red" }
    ];

    useEffect(() => {
        fetchLogs();
        fetchStats();
        if (isSuperAdmin()) {
            fetchAdmins();
        }
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
                ...(filters.entityType && { entityType: filters.entityType }),
                ...(filters.severity && { severity: filters.severity }),
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

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/activity-logs/summary?days=7`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Calculate stats from summary data
                const today = new Date().toISOString().split('T')[0];
                const todayStats = res.data.summary.find(s => s._id === today);

                // Count critical and warning logs
                const criticalCount = logs.filter(l => l.severity === 'critical').length;
                const warningCount = logs.filter(l => l.severity === 'warning').length;

                setStats({
                    totalToday: todayStats?.total || 0,
                    totalWeek: res.data.summary.reduce((acc, s) => acc + s.total, 0),
                    criticalCount,
                    warningCount
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setAdmins(res.data.admins);
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    const handleExport = async (format = 'csv') => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                format,
                ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
                ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
                ...(filters.action && { action: filters.action }),
                ...(filters.adminId && { adminId: filters.adminId }),
                ...(filters.severity && { severity: filters.severity })
            });

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/activity-logs/export?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting logs:", error);
        }
    };

    const handleDatePreset = (preset) => {
        setDateRangePreset(preset);
        const now = new Date();
        const start = new Date();

        switch (preset) {
            case "today":
                start.setHours(0, 0, 0, 0);
                setFilters({ ...filters, startDate: start, endDate: now });
                break;
            case "yesterday":
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                setFilters({ ...filters, startDate: start, endDate: end });
                break;
            case "week":
                start.setDate(now.getDate() - 7);
                setFilters({ ...filters, startDate: start, endDate: now });
                break;
            case "month":
                start.setMonth(now.getMonth() - 1);
                setFilters({ ...filters, startDate: start, endDate: now });
                break;
            case "custom":
                setFilters({ ...filters, startDate: null, endDate: null });
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setFilters({
            startDate: null,
            endDate: null,
            action: "",
            adminId: "",
            entityType: "",
            severity: "",
            search: ""
        });
        setDateRangePreset("custom");
        setPagination({ ...pagination, page: 1 });
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'text-green-700 bg-green-100 border-green-200';
        if (action.includes('UPDATE') || action.includes('CHANGE')) return 'text-blue-700 bg-blue-100 border-blue-200';
        if (action.includes('DELETE')) return 'text-red-700 bg-red-100 border-red-200';
        if (action.includes('BULK')) return 'text-purple-700 bg-purple-100 border-purple-200';
        if (action.includes('ARCHIVE') || action.includes('UNARCHIVE')) return 'text-orange-700 bg-orange-100 border-orange-200';
        return 'text-gray-700 bg-gray-100 border-gray-200';
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return <FaExclamationTriangle className="text-red-500" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'subtask': return '📋';
            case 'project': return '📊';
            case 'employee': return '👤';
            case 'client': return '🤝';
            case 'department': return '🏢';
            case 'designation': return '📌';
            case 'admin': return '👑';
            default: return '📝';
        }
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

    const formatDuration = (ms) => {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    if (loading && logs.length === 0) return <LoadingOverlay />;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaHistory className="text-xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
                            <p className="text-sm text-gray-500">Track all admin actions across the system</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showFilters
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <FaFilter />
                            Filters
                            {(filters.action || filters.adminId || filters.entityType || filters.severity || filters.search) && (
                                <span className="ml-1 px-1.5 py-0.5 bg-white text-blue-600 text-xs rounded-full">
                                    Active
                                </span>
                            )}
                        </button>
                        <div
                            className="relative inline-block"
                            onMouseEnter={() => setShowExportMenu(true)}
                            onMouseLeave={() => setShowExportMenu(false)}
                        >
                            {/* Export Button */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                                <FaDownload />
                                Export
                            </button>

                            {/* Dropdown */}
                            {showExportMenu && (
                                <div className="absolute right-0 top-full mt-0 w-48  z-50">
                                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 my-1">
                                        <button
                                            onClick={() => handleExport("csv")}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FaFileCsv className="text-green-600" /> CSV Format
                                        </button>

                                        <button
                                            onClick={() => handleExport("json")}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <span className="text-blue-600">{'{ }'}</span> JSON Format
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <p className="text-xs text-blue-600 uppercase font-semibold">Today</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.totalToday}</p>
                            <p className="text-xs text-blue-500">activities</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <p className="text-xs text-purple-600 uppercase font-semibold">This Week</p>
                            <p className="text-2xl font-bold text-purple-700">{stats.totalWeek}</p>
                            <p className="text-xs text-purple-500">activities</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                            <p className="text-xs text-yellow-600 uppercase font-semibold">Warnings</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.warningCount}</p>
                            <p className="text-xs text-yellow-500">need review</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-xs text-red-600 uppercase font-semibold">Critical</p>
                            <p className="text-2xl font-bold text-red-700">{stats.criticalCount}</p>
                            <p className="text-xs text-red-500">require attention</p>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700">Filter Logs</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Date Range Presets */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaCalendarAlt className="inline mr-1" /> Date Range
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['today', 'yesterday', 'week', 'month', 'custom'].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => handleDatePreset(preset)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateRangePreset === preset
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Pickers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <DatePicker
                                    selected={filters.startDate}
                                    onChange={(date) => {
                                        setFilters({ ...filters, startDate: date });
                                        setDateRangePreset("custom");
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="Select start date"
                                    maxDate={filters.endDate || new Date()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <DatePicker
                                    selected={filters.endDate}
                                    onChange={(date) => {
                                        setFilters({ ...filters, endDate: date });
                                        setDateRangePreset("custom");
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="Select end date"
                                    minDate={filters.startDate}
                                    maxDate={new Date()}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Action Type - Grouped by Category */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                <select
                                    value={filters.action}
                                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Actions</option>
                                    {Object.entries(actionCategories).map(([category, actions]) => (
                                        <optgroup key={category} label={category}>
                                            {actions.map(action => (
                                                <option key={action.value} value={action.value}>
                                                    {action.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Admin Filter (Super Admin only) */}
                            {isSuperAdmin() && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FaUserShield className="inline mr-1" /> Admin
                                    </label>
                                    <select
                                        value={filters.adminId}
                                        onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Admins</option>
                                        {admins.map(admin => (
                                            <option key={admin._id} value={admin._id}>
                                                {admin.username} ({admin.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Entity Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                                <select
                                    value={filters.entityType}
                                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {entityTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {severityLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaSearch className="inline mr-1" /> Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        placeholder="Search by description, admin name, entity name..."
                                        className="w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters({ ...filters, search: "" })}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            >
                                <FaSync /> Clear All
                            </button>
                            <button
                                onClick={() => {
                                    setPagination({ ...pagination, page: 1 });
                                    fetchLogs();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Table */}
            <div className={`${showFilters ? 'mt-6' : 'mt-0'}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
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
                                        Severity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No activity logs found</p>
                                            <p className="text-sm">Try adjusting your filters or clear them to see more results.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    <span title={new Date(log.createdAt).toLocaleString()}>
                                                        {formatDate(log.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm mr-2">
                                                        {log.admin.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.admin.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {log.admin.role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getActionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getEntityIcon(log.entity.type)}</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.entity.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {log.entity.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                <p className="truncate" title={log.description}>
                                                    {log.description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {getSeverityIcon(log.severity)}
                                                    <span className={`text-xs font-medium ${log.severity === 'critical' ? 'text-red-600' :
                                                        log.severity === 'warning' ? 'text-yellow-600' :
                                                            'text-blue-600'
                                                        }`}>
                                                        {log.severity?.charAt(0).toUpperCase() + log.severity?.slice(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.length > 0 && (
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.pages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        of <span className="font-medium">{pagination.total.toLocaleString()}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                            let pageNum;
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === pageNum
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                            disabled={pagination.page === pagination.pages}
                                            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Activity Details</h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Admin</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                            {selectedLog.admin.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedLog.admin.username}</p>
                                            <p className="text-sm text-gray-500">{selectedLog.admin.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                                    <p className="mt-1 font-medium">{formatDate(selectedLog.createdAt)}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(selectedLog.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Action & Entity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Action</label>
                                    <div className="mt-2">
                                        <span className={`px-3 py-1.5 text-sm rounded-full border ${getActionColor(selectedLog.action)}`}>
                                            {selectedLog.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Entity</label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-2xl">{getEntityIcon(selectedLog.entity.type)}</span>
                                        <div>
                                            <p className="font-medium">{selectedLog.entity.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">Type: {selectedLog.entity.type}</p>
                                            {selectedLog.entity.id && (
                                                <p className="text-xs text-gray-400">ID: {selectedLog.entity.id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                <p className="mt-2 text-gray-800">{selectedLog.description}</p>
                            </div>

                            {/* Changes */}
                            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase mb-3">Changes</label>

                                    {selectedLog.changes.updatedFields && selectedLog.changes.updatedFields.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700">Fields Changed:</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedLog.changes.updatedFields.map(field => (
                                                    <span key={field} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        {field.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.changes.before && selectedLog.changes.after && (
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-sm font-medium text-red-600 mb-2">Before</p>
                                                <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-auto max-h-40">
                                                    {JSON.stringify(selectedLog.changes.before, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-600 mb-2">After</p>
                                                <pre className="text-xs bg-white p-3 rounded border border-green-200 overflow-auto max-h-40">
                                                    {JSON.stringify(selectedLog.changes.after, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Related To */}
                            {selectedLog.relatedTo && Object.keys(selectedLog.relatedTo).some(key => selectedLog.relatedTo[key]?.id) && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase mb-3">Related To</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedLog.relatedTo?.project?.id && (
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Project</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.project.name}</p>
                                            </div>
                                        )}
                                        {selectedLog.relatedTo?.employee?.id && (
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Employee</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.employee.name}</p>
                                            </div>
                                        )}
                                        {selectedLog.relatedTo?.client?.id && (
                                            <div className="bg-white p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Client</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.client.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-xs font-medium text-gray-500 uppercase mb-3">Metadata</label>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">IP Address:</p>
                                        <p className="font-mono">{selectedLog.metadata?.ipAddress || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">User Agent:</p>
                                        <p className="text-sm truncate" title={selectedLog.metadata?.userAgent}>
                                            {selectedLog.metadata?.userAgent || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Severity:</p>
                                        <div className="flex items-center gap-1">
                                            {getSeverityIcon(selectedLog.severity)}
                                            <span className={`font-medium ${selectedLog.severity === 'critical' ? 'text-red-600' :
                                                selectedLog.severity === 'warning' ? 'text-yellow-600' :
                                                    'text-blue-600'
                                                }`}>
                                                {selectedLog.severity?.charAt(0).toUpperCase() + selectedLog.severity?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Log ID:</p>
                                        <p className="font-mono text-xs">{selectedLog._id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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