import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ─── formatters ─────────────────────────────────────────────────────────── */
const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n || 0}`;
};

/* ─── constants ──────────────────────────────────────────────────────────── */
const STAGE_COLORS = {
    "CAD Design": "#3b82f6",
    "SET Design": "#8b5cf6",
    Render: "#f59e0b",
    QC: "#10b981",
    Delivery: "#ef4444",
};
const PALETTE = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#f97316"];
const stageColor = (name, i) => STAGE_COLORS[name] || PALETTE[i % PALETTE.length];

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "timeline", label: "Timeline" },
    { key: "employees", label: "Employees" },
    { key: "stages", label: "Stages" },
    { key: "clients", label: "Clients" },
];

const PAGE_SIZE = 15;

/* ─── helpers ────────────────────────────────────────────────────────────── */
const downloadCSV = (rows, filename) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(",")),
    ].join("\n");
    const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
        download: filename,
    });
    a.click();
};

/* ─── sub-components ─────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[130px]">
            {label && <p className="font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
                        <span className="text-gray-500 text-xs">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-xs">{fmt(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

const StatCard = ({ label, value, icon, bg }) => (
    <div className={`${bg} rounded-xl p-3 sm:p-4`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800">{value}</p>
            </div>
            {icon}
        </div>
    </div>
);

const ExportBtn = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export CSV
    </button>
);

/* ─── main ───────────────────────────────────────────────────────────────── */
const EarningsReport = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [subtasks, setSubtasks] = useState([]);
    const [employees, setEmployees] = useState({});
    const [clients, setClients] = useState({});
    const [projects, setProjects] = useState({});

    const [activeTab, setActiveTab] = useState("overview");
    const [dateRange, setDateRange] = useState("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [selectedClient, setSelectedClient] = useState("all");
    const [timelineSearch, setTimelineSearch] = useState("");
    const [timelinePage, setTimelinePage] = useState(1);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [stRes, empRes, cliRes, projRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get-all`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all`),
                ]);
                const empMap = {};
                (empRes.data || []).forEach((e) => { empMap[e._id] = e; });
                const cliMap = {};
                (cliRes.data || []).forEach((c) => { cliMap[c._id] = c; });
                const projMap = {};
                (projRes.data?.projects || projRes.data || []).forEach((p) => { projMap[p._id] = p; });
                setEmployees(empMap);
                setClients(cliMap);
                setProjects(projMap);
                setSubtasks(stRes.data || []);
            } catch (err) {
                console.error("EarningsReport load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        let list = subtasks.filter((s) => (s.total_price || 0) > 0);

        if (dateRange === "custom") {
            if (customFrom || customTo) {
                const from = customFrom ? new Date(customFrom) : null;
                const to = customTo ? new Date(customTo + "T23:59:59.999") : null;
                list = list.filter((s) => {
                    const d = new Date(s.assign_date || s.createdAt);
                    if (from && d < from) return false;
                    if (to && d > to) return false;
                    return true;
                });
            }
        } else if (dateRange !== "all") {
            const cutoff = new Date();
            if (dateRange === "week") cutoff.setDate(cutoff.getDate() - 7);
            if (dateRange === "month") cutoff.setMonth(cutoff.getMonth() - 1);
            if (dateRange === "quarter") cutoff.setMonth(cutoff.getMonth() - 3);
            if (dateRange === "year") cutoff.setFullYear(cutoff.getFullYear() - 1);
            list = list.filter((s) => new Date(s.assign_date || s.createdAt) >= cutoff);
        }

        if (selectedClient !== "all") {
            list = list.filter((s) => projects[s.project_id]?.client_id === selectedClient);
        }
        return list;
    }, [subtasks, dateRange, customFrom, customTo, selectedClient, projects]);

    const summary = useMemo(() => {
        const totalValue = filtered.reduce((s, t) => s + (t.total_price || 0), 0);
        const earnedValue = filtered.reduce((s, t) => s + (t.earned_amount || 0), 0);
        const pendingValue = totalValue - earnedValue;
        const percent = totalValue > 0 ? Math.round((earnedValue / totalValue) * 100) : 0;
        return { totalValue, earnedValue, pendingValue, percent, totalTasks: filtered.length };
    }, [filtered]);

    const monthlyData = useMemo(() => {
        const map = {};
        filtered.forEach((s) => {
            (s.stages || []).filter((st) => st.completed && st.completed_at).forEach((st) => {
                const d = new Date(st.completed_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
                if (!map[key]) map[key] = { month: label, earned: 0, pending: 0 };
                map[key].earned += st.price || 0;
            });
            const d = new Date(s.assign_date || s.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
            if (!map[key]) map[key] = { month: label, earned: 0, pending: 0 };
            const earned = (s.stages || []).filter((st) => st.completed).reduce((a, st) => a + (st.price || 0), 0);
            map[key].pending += Math.max(0, (s.total_price || 0) - earned);
        });
        return Object.keys(map).sort().map((k) => map[k]);
    }, [filtered]);

    const stageData = useMemo(() => {
        const map = {};
        filtered.forEach((s) => {
            (s.stages || []).forEach((st) => {
                const name = st.name || st;
                if (!map[name]) map[name] = { stage: name, total: 0, earned: 0, count: 0, completedCount: 0 };
                map[name].total += st.price || 0;
                map[name].count += 1;
                if (st.completed) { map[name].earned += st.price || 0; map[name].completedCount += 1; }
            });
        });
        return Object.values(map);
    }, [filtered]);

    const employeeData = useMemo(() => {
        const map = {};
        filtered.forEach((s) => {
            (s.stages || []).filter((st) => st.completed && st.completed_by).forEach((st) => {
                const id = String(st.completed_by);
                const emp = employees[id];
                if (!map[id]) map[id] = { id, name: emp?.full_name || "Unknown", earned: 0, stages: 0, profile_pic: emp?.profile_pic };
                map[id].earned += st.price || 0;
                map[id].stages += 1;
            });
        });
        return Object.values(map).sort((a, b) => b.earned - a.earned);
    }, [filtered, employees]);

    const clientData = useMemo(() => {
        const map = {};
        filtered.forEach((s) => {
            const proj = projects[s.project_id];
            if (!proj?.client_id) return;
            const cid = proj.client_id;
            if (!map[cid]) map[cid] = { name: clients[cid]?.full_name || "Unknown", total: 0, earned: 0, pending: 0 };
            map[cid].total += s.total_price || 0;
            map[cid].earned += s.earned_amount || 0;
            map[cid].pending += (s.total_price || 0) - (s.earned_amount || 0);
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
    }, [filtered, projects, clients]);

    const timeline = useMemo(() => {
        const events = [];
        filtered.forEach((s) => {
            const proj = projects[s.project_id];
            const client = clients[proj?.client_id];
            (s.stages || []).filter((st) => st.completed && st.completed_at).forEach((st) => {
                const emp = employees[String(st.completed_by)];
                events.push({
                    date: new Date(st.completed_at),
                    stageName: st.name,
                    price: st.price || 0,
                    taskName: s.task_name,
                    projectName: proj?.project_name || "—",
                    clientName: client?.full_name || "—",
                    employeeName: emp?.full_name || "—",
                    employeePic: emp?.profile_pic,
                });
            });
        });
        return events.sort((a, b) => b.date - a.date);
    }, [filtered, projects, clients, employees]);

    const filteredTimeline = useMemo(() => {
        if (!timelineSearch) return timeline;
        const q = timelineSearch.toLowerCase();
        return timeline.filter((e) =>
            [e.taskName, e.projectName, e.clientName, e.employeeName, e.stageName].some((v) =>
                v?.toLowerCase().includes(q)
            )
        );
    }, [timeline, timelineSearch]);

    const pagedTimeline = filteredTimeline.slice(0, timelinePage * PAGE_SIZE);

    const dlTimeline = () =>
        downloadCSV(
            timeline.map((e) => ({
                Date: e.date.toLocaleDateString("en-IN"),
                Stage: e.stageName, Amount: e.price, Task: e.taskName,
                Project: e.projectName, Client: e.clientName, "Completed By": e.employeeName,
            })),
            `earnings-timeline-${new Date().toISOString().slice(0, 10)}.csv`
        );
    const dlEmployees = () =>
        downloadCSV(
            employeeData.map((e) => ({ Employee: e.name, "Stages Completed": e.stages, "Total Earned (INR)": e.earned })),
            `employee-earnings-${new Date().toISOString().slice(0, 10)}.csv`
        );
    const dlStages = () =>
        downloadCSV(
            stageData.map((s) => ({
                Stage: s.stage, "Total Value": s.total, Earned: s.earned,
                Pending: s.total - s.earned, Occurrences: s.count, Completed: s.completedCount,
            })),
            `stage-earnings-${new Date().toISOString().slice(0, 10)}.csv`
        );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading earnings data…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            {/* ── Header ── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Earnings Report</h1>
                            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">
                                Full financial overview — stages, employees, clients &amp; trends
                            </p>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value);
                                if (e.target.value !== "custom") { setCustomFrom(""); setCustomTo(""); }
                            }}
                            className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                            <option value="all">All Time</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {/* Custom date pickers */}
                        {dateRange === "custom" && (
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <span className="text-gray-400 text-xs sm:text-sm">to</span>
                                <input
                                    type="date"
                                    value={customTo}
                                    min={customFrom || undefined}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                        )}

                        <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                            <option value="all">All Clients</option>
                            {Object.values(clients).map((c) => (
                                <option key={c._id} value={c._id}>{c.full_name}</option>
                            ))}
                        </select>

                        <button
                            onClick={dlTimeline}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7,10 12,15 17,10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span className="hidden xs:inline">Download Report</span>
                            <span className="xs:hidden">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <StatCard label="Total Contract" value={fmtShort(summary.totalValue)}
                        bg="bg-red-50 shadow-sm border border-gray-200"
                        icon={<div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0"><img src="/SVG/icon-1.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" /></div>} />
                    <StatCard label="Earned" value={fmtShort(summary.earnedValue)}
                        bg="bg-green-50 shadow-sm border border-gray-200"
                        icon={<div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0"><img src="/SVG/true-green.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" /></div>} />
                    <StatCard label="Pending" value={fmtShort(summary.pendingValue)}
                        bg="bg-yellow-50 shadow-sm border border-gray-200"
                        icon={<div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0"><img src="/SVG/icon-3.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" /></div>} />
                    <StatCard label="Completion" value={`${summary.percent}%`}
                        bg="bg-blue-50 shadow-sm border border-gray-200"
                        icon={<div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0"><img src="/SVG/true-green.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" /></div>} />
                    <StatCard label="Contributors" value={employeeData.length}
                        bg="bg-purple-50 shadow-sm border border-gray-200"
                        icon={<div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white flex-shrink-0"><img src="/SVG/icon-2.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6" /></div>} />
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Overall Earning Progress</span>
                        <span className="text-xs sm:text-sm font-bold text-blue-600">{summary.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 sm:h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 sm:h-3 rounded-full transition-all duration-700"
                            style={{ width: `${summary.percent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                        <span>Earned: {fmt(summary.earnedValue)}</span>
                        <span>Total: {fmt(summary.totalValue)}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${activeTab === tab.key
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* ── Overview ── */}
                        {activeTab === "overview" && (
                            <div className="space-y-5 sm:space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Earned vs Pending</h3>
                                    {monthlyData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <AreaChart data={monthlyData}>
                                                <defs>
                                                    <linearGradient id="gEarned" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "#9ca3af" }} width={55} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Legend iconType="circle" iconSize={8} />
                                                <Area type="monotone" dataKey="earned" name="Earned" stroke="#22c55e" strokeWidth={2.5} fill="url(#gEarned)" />
                                                <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gPending)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No monthly data yet</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Clients</h3>
                                        {clientData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart data={clientData.slice(0, 5)} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                                    <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={60} />
                                                    <Tooltip content={<ChartTooltip />} />
                                                    <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[0, 4, 4, 0]} maxBarSize={16} />
                                                    <Bar dataKey="pending" name="Pending" fill="#fde68a" radius={[0, 4, 4, 0]} maxBarSize={16} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No client data</div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Stage Contribution</h3>
                                        {stageData.length > 0 ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                                                <ResponsiveContainer width="100%" height={180} className="flex-shrink-0 sm:w-[55%] sm:max-w-[55%]">
                                                    <PieChart>
                                                        <Pie data={stageData} dataKey="earned" nameKey="stage" cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={3}>
                                                            {stageData.map((entry, i) => <Cell key={i} fill={stageColor(entry.stage, i)} />)}
                                                        </Pie>
                                                        <Tooltip formatter={(v) => fmt(v)} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="flex-1 space-y-1.5 w-full">
                                                    {stageData.map((s, i) => {
                                                        const color = stageColor(s.stage, i);
                                                        const pct = summary.earnedValue > 0 ? Math.round((s.earned / summary.earnedValue) * 100) : 0;
                                                        return (
                                                            <div key={i} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }}></span>
                                                                    <span className="text-xs text-gray-600">{s.stage}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-xs font-bold text-gray-700">{pct}%</span>
                                                                    <span className="text-xs text-gray-400 ml-1">{fmtShort(s.earned)}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No stage data</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Timeline ── */}
                        {activeTab === "timeline" && (
                            <div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                                    <div className="relative flex-1" style={{ minWidth: "160px" }}>
                                        <svg className="absolute left-3 top-2.5 text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search…"
                                            value={timelineSearch}
                                            onChange={(e) => { setTimelineSearch(e.target.value); setTimelinePage(1); }}
                                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{filteredTimeline.length} events</span>
                                    <ExportBtn onClick={dlTimeline} />
                                </div>

                                {filteredTimeline.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <div className="text-4xl mb-3">📭</div>
                                        <p className="text-sm">No events found</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                                            <div className="inline-block min-w-full px-4 sm:px-0">
                                                <table className="w-full text-sm" style={{ minWidth: "640px" }}>
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            {["Date", "Stage", "Task", "Project", "Client", "Completed By", "Amount"].map((h, i) => (
                                                                <th key={i} className={`py-2.5 px-2 sm:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {pagedTimeline.map((event, i) => {
                                                            const color = stageColor(event.stageName, i);
                                                            return (
                                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="py-2.5 px-2 sm:px-3 text-gray-500 whitespace-nowrap text-xs">
                                                                        {event.date.toLocaleDateString("en-IN")}
                                                                    </td>
                                                                    <td className="py-2.5 px-2 sm:px-3">
                                                                        <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ background: color }}>
                                                                            {event.stageName}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2.5 px-2 sm:px-3 text-gray-700 font-medium max-w-[130px] truncate text-xs" title={event.taskName}>
                                                                        {event.taskName}
                                                                    </td>
                                                                    <td className="py-2.5 px-2 sm:px-3 text-gray-500 text-xs max-w-[100px] truncate" title={event.projectName}>
                                                                        {event.projectName}
                                                                    </td>
                                                                    <td className="py-2.5 px-2 sm:px-3 text-gray-500 text-xs whitespace-nowrap">{event.clientName}</td>
                                                                    <td className="py-2.5 px-2 sm:px-3">
                                                                        <div className="flex items-center gap-1.5">
                                                                            {event.employeePic ? (
                                                                                <img src={event.employeePic} alt={event.employeeName} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0" />
                                                                            ) : (
                                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                                    {event.employeeName.charAt(0)}
                                                                                </div>
                                                                            )}
                                                                            <span className="text-xs text-gray-600 whitespace-nowrap">{event.employeeName}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-2.5 px-2 sm:px-3 text-right">
                                                                        <span className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">+{fmt(event.price)}</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {pagedTimeline.length < filteredTimeline.length && (
                                            <div className="text-center mt-4 sm:mt-5">
                                                <button
                                                    onClick={() => setTimelinePage((p) => p + 1)}
                                                    className="px-4 sm:px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                                >
                                                    Load more ({filteredTimeline.length - pagedTimeline.length} remaining)
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Employees ── */}
                        {activeTab === "employees" && (
                            <div className="space-y-5 sm:space-y-6">
                                <div className="flex justify-end"><ExportBtn onClick={dlEmployees} /></div>
                                {employeeData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={employeeData.slice(0, 10)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => v.split(" ")[0]} />
                                            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: "#9ca3af" }} width={50} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Bar dataKey="earned" name="Earned" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data</div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700">Leaderboard</h3>
                                    {employeeData.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No employee earnings yet</div>
                                    ) : (
                                        employeeData.map((emp, i) => {
                                            const pct = Math.round((emp.earned / (employeeData[0]?.earned || 1)) * 100);
                                            const medals = ["🥇", "🥈", "🥉"];
                                            return (
                                                <div key={emp.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                    <span className="text-base sm:text-lg w-6 sm:w-7 text-center flex-shrink-0">
                                                        {i < 3 ? medals[i] : <span className="text-xs text-gray-400 font-bold">#{i + 1}</span>}
                                                    </span>
                                                    {emp.profile_pic ? (
                                                        <img src={emp.profile_pic} alt={emp.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{emp.name}</span>
                                                            <div className="text-right flex-shrink-0 ml-2">
                                                                <span className="text-xs sm:text-sm font-bold text-green-600">{fmt(emp.earned)}</span>
                                                                <span className="text-xs text-gray-400 ml-1 hidden sm:inline">{emp.stages} stages</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Stages ── */}
                        {activeTab === "stages" && (
                            <div className="space-y-5 sm:space-y-6">
                                <div className="flex justify-end"><ExportBtn onClick={dlStages} /></div>
                                {stageData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={stageData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "#9ca3af" }} width={50} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend iconType="circle" iconSize={8} />
                                            <Bar dataKey="total" name="Total" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                            <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No stage data</div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {stageData.map((stage, i) => {
                                        const color = stageColor(stage.stage, i);
                                        const pct = stage.total > 0 ? Math.round((stage.earned / stage.total) * 100) : 0;
                                        return (
                                            <div key={i} className="rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 transition-colors">
                                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }}></span>
                                                    <h4 className="font-semibold text-gray-800 text-sm">{stage.stage}</h4>
                                                </div>
                                                <div className="space-y-1.5 mb-3 sm:mb-4">
                                                    {[
                                                        { label: "Total", val: fmt(stage.total), cls: "text-gray-700" },
                                                        { label: "Earned", val: fmt(stage.earned), cls: "text-green-600" },
                                                        { label: "Pending", val: fmt(stage.total - stage.earned), cls: "text-yellow-600" },
                                                        { label: "Occurrences", val: stage.count, cls: "text-gray-500" },
                                                        { label: "Completed", val: stage.completedCount, cls: "text-blue-600" },
                                                    ].map((row, j) => (
                                                        <div key={j} className="flex justify-between text-xs sm:text-sm">
                                                            <span className="text-gray-400">{row.label}</span>
                                                            <span className={`font-semibold ${row.cls}`}>{row.val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }}></div>
                                                </div>
                                                <p className="text-xs text-right mt-1 font-medium" style={{ color }}>{pct}% earned</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Clients ── */}
                        {activeTab === "clients" && (
                            <div className="space-y-5 sm:space-y-6">
                                {clientData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={clientData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
                                            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10, fill: "#9ca3af" }} width={50} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend iconType="circle" iconSize={8} />
                                            <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                            <Bar dataKey="pending" name="Pending" fill="#fde68a" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No client data</div>
                                )}

                                <div className="space-y-2 sm:space-y-3">
                                    {clientData.map((client, i) => {
                                        const pct = client.total > 0 ? Math.round((client.earned / client.total) * 100) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{client.name}</span>
                                                        <div className="text-right flex-shrink-0 ml-2">
                                                            <p className="text-xs sm:text-sm font-bold text-green-600">{fmt(client.earned)}</p>
                                                            <p className="text-xs text-gray-400">of {fmt(client.total)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                        <span>Pending: {fmt(client.pending)}</span>
                                                        <span>{pct}% collected</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsReport;