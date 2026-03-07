import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    AreaChart, Area, ResponsiveContainer, Tooltip, XAxis
} from "recharts";

const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
    if (n >= 1000) return `₹${(n / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}K`;
    return `₹${n}`;
};

const EarningsWidget = () => {
    const [loading, setLoading] = useState(true);
    const [subtasks, setSubtasks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/subtask/get-all`
                );
                setSubtasks(res.data || []);
            } catch (err) {
                console.error("EarningsWidget fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Summary ──────────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const priced = subtasks.filter((s) => (s.total_price || 0) > 0);
        const totalValue = priced.reduce((s, t) => s + (t.total_price || 0), 0);
        const earnedValue = priced.reduce((s, t) => s + (t.earned_amount || 0), 0);
        const pendingValue = totalValue - earnedValue;
        const percent = totalValue > 0 ? Math.round((earnedValue / totalValue) * 100) : 0;
        return { totalValue, earnedValue, pendingValue, percent };
    }, [subtasks]);

    // ── Last 6 months spark data ─────────────────────────────────────────────
    const sparkData = useMemo(() => {
        const map = {};
        subtasks.forEach((s) => {
            (s.stages || []).filter((st) => st.completed && st.completed_at).forEach((st) => {
                const d = new Date(st.completed_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                const label = d.toLocaleString("default", { month: "short" });
                if (!map[key]) map[key] = { month: label, earned: 0 };
                map[key].earned += st.price || 0;
            });
        });
        return Object.keys(map).sort().slice(-6).map((k) => map[k]);
    }, [subtasks]);

    // ── Top 3 earning employees this context ─────────────────────────────────
    const topEmp = useMemo(() => {
        const map = {};
        subtasks.forEach((s) => {
            (s.stages || []).filter((st) => st.completed && st.completed_by).forEach((st) => {
                const id = String(st.completed_by);
                if (!map[id]) map[id] = { id, earned: 0, stages: 0 };
                map[id].earned += st.price || 0;
                map[id].stages += 1;
            });
        });
        return Object.values(map).sort((a, b) => b.earned - a.earned).slice(0, 3);
    }, [subtasks]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-400">Loading earnings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Earnings Overview</h3>
                        <p className="text-xs text-gray-400">All time</p>
                    </div>
                </div>
                <Link
                    to="/earnings-report"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    Full Report
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* 3 stat pills */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Total</p>
                    <p className="text-sm font-bold text-gray-800">{fmtShort(summary.totalValue)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-0.5">Earned</p>
                    <p className="text-sm font-bold text-green-700">{fmtShort(summary.earnedValue)}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-600 mb-0.5">Pending</p>
                    <p className="text-sm font-bold text-yellow-700">{fmtShort(summary.pendingValue)}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Earning progress</span>
                    <span className="text-blue-600 font-semibold">{summary.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${summary.percent}%` }}
                    ></div>
                </div>
            </div>

            {/* Mini sparkline */}
            {sparkData.length > 1 && (
                <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Monthly earned trend</p>
                    <ResponsiveContainer width="100%" height={56}>
                        <AreaChart data={sparkData}>
                            <defs>
                                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" hide />
                            <Tooltip
                                formatter={(v) => fmt(v)}
                                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                itemStyle={{ color: "#16a34a" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="earned"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fill="url(#wGrad)"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top earners */}
            {topEmp.length > 0 && (
                <div>
                    <p className="text-xs text-gray-400 mb-2">Top earners</p>
                    <div className="space-y-1.5">
                        {topEmp.map((emp, i) => {
                            const max = topEmp[0]?.earned || 1;
                            const pct = Math.round((emp.earned / max) * 100);
                            const medals = ["🥇", "🥈", "🥉"];
                            return (
                                <div key={emp.id} className="flex items-center gap-2">
                                    <span className="text-sm w-5 text-center">{medals[i]}</span>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-400 h-1.5 rounded-full"
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 w-14 text-right">
                                        {fmtShort(emp.earned)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarningsWidget;