// src/pages/admin/ActivityLogs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import {
    FaFilter, FaDownload, FaEye, FaHistory, FaTimes, FaCalendarAlt,
    FaUserShield, FaExclamationTriangle, FaInfoCircle, FaSearch,
    FaFileCsv, FaSync,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ─── constants ──────────────────────────────────────────────────────────── */
const ACTION_CATEGORIES = {
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
        { value: "STOP_TIMER", label: "Stop Timer" },
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
        { value: "UNARCHIVE_PROJECT", label: "Unarchive Project" },
    ],
    "Employee Actions": [
        { value: "CREATE_EMPLOYEE", label: "Create Employee" },
        { value: "UPDATE_EMPLOYEE", label: "Update Employee" },
        { value: "DELETE_EMPLOYEE", label: "Delete Employee" },
    ],
    "Client Actions": [
        { value: "CREATE_CLIENT", label: "Create Client" },
        { value: "UPDATE_CLIENT", label: "Update Client" },
        { value: "DELETE_CLIENT", label: "Delete Client" },
    ],
    "Department & Designation": [
        { value: "CREATE_DEPARTMENT", label: "Create Department" },
        { value: "UPDATE_DEPARTMENT", label: "Update Department" },
        { value: "DELETE_DEPARTMENT", label: "Delete Department" },
        { value: "CREATE_DESIGNATION", label: "Create Designation" },
        { value: "UPDATE_DESIGNATION", label: "Update Designation" },
        { value: "DELETE_DESIGNATION", label: "Delete Designation" },
    ],
    "Admin Actions": [
        { value: "CREATE_ADMIN", label: "Create Admin" },
        { value: "UPDATE_ADMIN", label: "Update Admin" },
        { value: "DELETE_ADMIN", label: "Delete Admin" },
        { value: "UPDATE_ADMIN_PROFILE", label: "Update Admin Profile" },
    ],
};

const ENTITY_TYPES = [
    { value: "", label: "All Entities" },
    { value: "subtask", label: "Subtask" },
    { value: "project", label: "Project" },
    { value: "employee", label: "Employee" },
    { value: "client", label: "Client" },
    { value: "department", label: "Department" },
    { value: "designation", label: "Designation" },
    { value: "admin", label: "Admin" },
];

const SEVERITY_LEVELS = [
    { value: "", label: "All Severities" },
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "critical", label: "Critical" },
];

const DATE_PRESETS = ["today", "yesterday", "week", "month", "custom"];

const EMPTY_FILTERS = {
    startDate: null, endDate: null,
    action: "", adminId: "", entityType: "", severity: "", search: "",
};

/* ─── pure helpers ───────────────────────────────────────────────────────── */
const getActionColor = (action) => {
    if (action.includes("CREATE")) return "text-green-700 bg-green-100 border-green-200";
    if (action.includes("UPDATE") || action.includes("CHANGE")) return "text-blue-700 bg-blue-100 border-blue-200";
    if (action.includes("DELETE")) return "text-red-700 bg-red-100 border-red-200";
    if (action.includes("BULK")) return "text-purple-700 bg-purple-100 border-purple-200";
    if (action.includes("ARCHIVE") || action.includes("UNARCHIVE")) return "text-orange-700 bg-orange-100 border-orange-200";
    return "text-gray-700 bg-gray-100 border-gray-200";
};

const getSeverityIcon = (severity) => {
    if (severity === "critical") return <FaExclamationTriangle className="text-red-500" />;
    if (severity === "warning") return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaInfoCircle className="text-blue-500" />;
};

const getSeverityTextClass = (severity) =>
    severity === "critical" ? "text-red-600" : severity === "warning" ? "text-yellow-600" : "text-blue-600";

const getEntityIcon = (type) =>
    ({ subtask: "📋", project: "📊", employee: "👤", client: "🤝", department: "🏢", designation: "📌", admin: "👑" }[type] ?? "📝");

const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

const hasActiveFilters = (f) =>
    !!(f.action || f.adminId || f.entityType || f.severity || f.search || f.startDate || f.endDate);

/* ─── sub-components ─────────────────────────────────────────────────────── */
const LogCard = ({ log, onView }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                    {log.admin.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{log.admin.username}</p>
                    <p className="text-xs text-gray-500">{log.admin.role}</p>
                </div>
            </div>
            <button
                onClick={() => onView(log)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                title="View Details"
            >
                <FaEye />
            </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-0.5 text-xs rounded-full border ${getActionColor(log.action)}`}>
                {log.action.replace(/_/g, " ")}
            </span>
            <div className="flex items-center gap-1">
                {getSeverityIcon(log.severity)}
                <span className={`text-xs font-medium ${getSeverityTextClass(log.severity)}`}>
                    {log.severity?.charAt(0).toUpperCase() + log.severity?.slice(1)}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <span className="text-base">{getEntityIcon(log.entity.type)}</span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{log.entity.name || "N/A"}</p>
                <p className="text-xs text-gray-500">{log.entity.type}</p>
            </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2">{log.description}</p>

        <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaCalendarAlt className="flex-shrink-0" />
            <span>{formatDate(log.createdAt)}</span>
        </div>
    </div>
);

/* ─── main component ─────────────────────────────────────────────────────── */
const ActivityLogs = () => {
    const { isSuperAdmin } = useAuth();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [dateRangePreset, setDateRangePreset] = useState("custom");

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    useEffect(() => {
        if (isSuperAdmin()) fetchAdmins();
    }, []);

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
                ...(filters.search && { search: filters.search }),
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

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) setAdmins(res.data.admins);
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    const handleExport = async (format = "csv") => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                format,
                ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
                ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
                ...(filters.action && { action: filters.action }),
                ...(filters.adminId && { adminId: filters.adminId }),
                ...(filters.severity && { severity: filters.severity }),
            });
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/activity-logs/export?${params}`,
                { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `activity-logs-${new Date().toISOString().split("T")[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowExportMenu(false);
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
                setFilters((f) => ({ ...f, startDate: start, endDate: now }));
                break;
            case "yesterday": {
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                setFilters((f) => ({ ...f, startDate: start, endDate: end }));
                break;
            }
            case "week":
                start.setDate(now.getDate() - 7);
                setFilters((f) => ({ ...f, startDate: start, endDate: now }));
                break;
            case "month":
                start.setMonth(now.getMonth() - 1);
                setFilters((f) => ({ ...f, startDate: start, endDate: now }));
                break;
            case "custom":
                setFilters((f) => ({ ...f, startDate: null, endDate: null }));
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setDateRangePreset("custom");
        setPagination((p) => ({ ...p, page: 1 }));
    };

    const setPage = (page) => setPagination((p) => ({ ...p, page }));

    if (loading && logs.length === 0) return <LoadingOverlay />;

    const activeFilters = hasActiveFilters(filters);

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            {/* ── Header ── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <FaHistory className="text-lg sm:text-xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Activity Logs</h1>
                            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track all admin actions across the system</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm relative ${showFilters ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <FaFilter className="text-xs" />
                            <span className="hidden xs:inline">Filters</span>
                            {activeFilters && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    !
                                </span>
                            )}
                        </button>

                        {/* Export */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowExportMenu(true)}
                            onMouseLeave={() => setShowExportMenu(false)}
                        >
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                                <FaDownload className="text-xs" />
                                <span className="hidden xs:inline">Export</span>
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 top-full z-50 w-44 pt-1">
                                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                                        <button
                                            onClick={() => handleExport("csv")}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                                        >
                                            <FaFileCsv className="text-green-600" /> CSV Format
                                        </button>
                                        <button
                                            onClick={() => handleExport("json")}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                                        >
                                            <span className="text-blue-600 font-mono text-xs">{"{ }"}</span> JSON Format
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Filters Panel ── */}
            {showFilters && (
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg mb-4 sm:mb-6">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700">Filter Logs</h3>
                            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Date Presets */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaCalendarAlt className="inline mr-1" /> Date Range
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DATE_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => handleDatePreset(preset)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateRangePreset === preset
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <DatePicker
                                    selected={filters.startDate}
                                    onChange={(date) => { setFilters((f) => ({ ...f, startDate: date })); setDateRangePreset("custom"); }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholderText="Select start date"
                                    maxDate={filters.endDate || new Date()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <DatePicker
                                    selected={filters.endDate}
                                    onChange={(date) => { setFilters((f) => ({ ...f, endDate: date })); setDateRangePreset("custom"); }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholderText="Select end date"
                                    minDate={filters.startDate}
                                    maxDate={new Date()}
                                />
                            </div>
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {/* Action Type */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                <select
                                    value={filters.action}
                                    onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Actions</option>
                                    {Object.entries(ACTION_CATEGORIES).map(([category, actions]) => (
                                        <optgroup key={category} label={category}>
                                            {actions.map((action) => (
                                                <option key={action.value} value={action.value}>{action.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Admin (super-admin only) */}
                            {isSuperAdmin() && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FaUserShield className="inline mr-1" /> Admin
                                    </label>
                                    <select
                                        value={filters.adminId}
                                        onChange={(e) => setFilters((f) => ({ ...f, adminId: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">All Admins</option>
                                        {admins.map((admin) => (
                                            <option key={admin._id} value={admin._id}>{admin.username} ({admin.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Entity Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                                <select
                                    value={filters.entityType}
                                    onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {ENTITY_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {SEVERITY_LEVELS.map((level) => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaSearch className="inline mr-1" /> Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                                        placeholder="Search by description, admin name, entity..."
                                        className="w-full py-2 pl-9 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <FaSync className="text-xs" /> Clear All
                            </button>
                            <button
                                onClick={() => { setPagination((p) => ({ ...p, page: 1 })); fetchLogs(); }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Table (desktop) / Cards (mobile) ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Timestamp", "Admin", "Action", "Entity", "Description", "Severity", ""].map((h) => (
                                    <th key={h} className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
                                        <p className="text-lg font-medium">No activity logs found</p>
                                        <p className="text-sm">Try adjusting or clearing your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                                                <span className="text-xs lg:text-sm">{formatDate(log.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                                                    {log.admin.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{log.admin.username}</div>
                                                    <div className="text-xs text-gray-500">{log.admin.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getActionColor(log.action)}`}>
                                                {log.action.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{getEntityIcon(log.entity.type)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{log.entity.name || "N/A"}</div>
                                                    <div className="text-xs text-gray-500">{log.entity.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            <p className="truncate" title={log.description}>{log.description}</p>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {getSeverityIcon(log.severity)}
                                                <span className={`text-xs font-medium ${getSeverityTextClass(log.severity)}`}>
                                                    {log.severity?.charAt(0).toUpperCase() + log.severity?.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
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

                {/* Mobile Cards */}
                <div className="md:hidden">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="font-medium">No activity logs found</p>
                            <p className="text-sm mt-1">Try adjusting or clearing your filters.</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-3">
                            {logs.map((log) => <LogCard key={log._id} log={log} onView={setSelectedLog} />)}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logs.length > 0 && (
                    <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                        {/* Mobile: just prev/next */}
                        <div className="flex sm:hidden justify-between items-center">
                            <button
                                onClick={() => setPage(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>

                        {/* Desktop: full pagination */}
                        <div className="hidden sm:flex sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                                {" "}–{" "}
                                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                                {" "}of{" "}
                                <span className="font-medium">{pagination.total.toLocaleString()}</span> results
                            </p>
                            <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPage(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 5) pageNum = i + 1;
                                    else if (pagination.page <= 3) pageNum = i + 1;
                                    else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                    else pageNum = pagination.page - 2 + i;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-4 py-2 border text-sm font-medium ${pagination.page === pageNum
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Details Modal ── */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Activity Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Admin + Timestamp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Admin</label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                                            {selectedLog.admin.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{selectedLog.admin.username}</p>
                                            <p className="text-xs text-gray-500">{selectedLog.admin.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                                    <p className="mt-2 font-medium text-sm">{formatDate(selectedLog.createdAt)}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(selectedLog.createdAt).toLocaleDateString("en-US", {
                                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Action + Entity */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Action</label>
                                    <div className="mt-2">
                                        <span className={`px-3 py-1 text-sm rounded-full border ${getActionColor(selectedLog.action)}`}>
                                            {selectedLog.action.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Entity</label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-2xl">{getEntityIcon(selectedLog.entity.type)}</span>
                                        <div>
                                            <p className="font-medium text-sm">{selectedLog.entity.name || "N/A"}</p>
                                            <p className="text-xs text-gray-500">Type: {selectedLog.entity.type}</p>
                                            {selectedLog.entity.id && <p className="text-xs text-gray-400">ID: {selectedLog.entity.id}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                <p className="mt-2 text-gray-800 text-sm">{selectedLog.description}</p>
                            </div>

                            {/* Changes */}
                            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase mb-3 block">Changes</label>
                                    {selectedLog.changes.updatedFields?.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Fields Changed:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedLog.changes.updatedFields.map((field) => (
                                                    <span key={field} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        {field.replace(/_/g, " ")}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedLog.changes.before && selectedLog.changes.after && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <p className="text-sm font-medium text-red-600 mb-1">Before</p>
                                                <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-auto max-h-40">
                                                    {JSON.stringify(selectedLog.changes.before, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-600 mb-1">After</p>
                                                <pre className="text-xs bg-white p-3 rounded border border-green-200 overflow-auto max-h-40">
                                                    {JSON.stringify(selectedLog.changes.after, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Related To */}
                            {selectedLog.relatedTo && Object.keys(selectedLog.relatedTo).some((k) => selectedLog.relatedTo[k]?.id) && (
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500 uppercase mb-3 block">Related To</label>
                                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                                        {selectedLog.relatedTo?.project?.id && (
                                            <div className="bg-white p-2 sm:p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Project</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.project.name}</p>
                                            </div>
                                        )}
                                        {selectedLog.relatedTo?.employee?.id && (
                                            <div className="bg-white p-2 sm:p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Employee</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.employee.name}</p>
                                            </div>
                                        )}
                                        {selectedLog.relatedTo?.client?.id && (
                                            <div className="bg-white p-2 sm:p-3 rounded border border-gray-200">
                                                <p className="text-xs text-gray-500">Client</p>
                                                <p className="font-medium text-sm">{selectedLog.relatedTo.client.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <label className="text-xs font-medium text-gray-500 uppercase mb-3 block">Metadata</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">IP Address</p>
                                        <p className="font-mono text-sm">{selectedLog.metadata?.ipAddress || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">User Agent</p>
                                        <p className="text-xs truncate" title={selectedLog.metadata?.userAgent}>
                                            {selectedLog.metadata?.userAgent || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Severity</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {getSeverityIcon(selectedLog.severity)}
                                            <span className={`font-medium text-sm ${getSeverityTextClass(selectedLog.severity)}`}>
                                                {selectedLog.severity?.charAt(0).toUpperCase() + selectedLog.severity?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Log ID</p>
                                        <p className="font-mono text-xs break-all">{selectedLog._id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-5 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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