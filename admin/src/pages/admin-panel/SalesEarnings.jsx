// src/pages/admin-panel/SalesEarnings.jsx
// Sales-based earnings report for brand (Mukhwas / Breeliq) admins. Built from
// the existing /api/sales/report-data endpoint (entries + monthly targets),
// scoped to the brands the logged-in admin is allowed to manage.
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { getSalesBrands } from "../../constants";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaChartLine, FaBullseye, FaCoins, FaCalendarAlt } from "react-icons/fa";

const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SalesEarnings = () => {
  const { user } = useAuth();

  const availableBrands = useMemo(() => getSalesBrands(user), [user]);

  const [activeBrand, setActiveBrand] = useState(availableBrands[0] || "");
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/sales/report-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setEntries(res.data.entries || []);
          setTargets(res.data.targets || []);
        }
      } catch (err) {
        console.error("Error loading sales earnings:", err);
        toast.error("Failed to load sales earnings");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  // Available years from the data (plus current year), newest first.
  const years = useMemo(() => {
    const set = new Set([new Date().getFullYear()]);
    entries.forEach((e) => {
      if (e.date) set.add(new Date(e.date).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [entries]);

  // Per-month achieved vs target for the active brand and year.
  const monthly = useMemo(() => {
    const rows = MONTHS.map((m, i) => ({ month: m, monthIndex: i, achieved: 0, target: 0 }));

    entries
      .filter((e) => e.brand === activeBrand && new Date(e.date).getFullYear() === year)
      .forEach((e) => {
        const mi = new Date(e.date).getMonth();
        rows[mi].achieved += e.amount || 0;
      });

    targets
      .filter((t) => t.brand === activeBrand && Number(t.year) === year)
      .forEach((t) => {
        const mi = Number(t.month);
        if (rows[mi]) rows[mi].target = t.target_amount || 0;
      });

    return rows;
  }, [entries, targets, activeBrand, year]);

  const summary = useMemo(() => {
    const achieved = monthly.reduce((s, r) => s + r.achieved, 0);
    const target = monthly.reduce((s, r) => s + r.target, 0);
    const percentage = target > 0 ? Math.round((achieved / target) * 100) : 0;
    return { achieved, target, percentage, remaining: Math.max(0, target - achieved) };
  }, [monthly]);

  if (loading) return <LoadingOverlay />;

  if (availableBrands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">You don't have access to any sales brand.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Sales Earnings</h1>
          </div>
          <div className="flex items-center gap-2">
            {availableBrands.length > 1 &&
              availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrand(b)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-bold transition-colors ${
                    activeBrand === b
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-2.5 text-gray-400 text-sm" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <SummaryCard icon={<FaCoins />} label="Total Achieved" value={fmt(summary.achieved)} color="text-emerald-600" />
        <SummaryCard icon={<FaBullseye />} label="Total Target" value={fmt(summary.target)} color="text-blue-600" />
        <SummaryCard icon={<FaChartLine />} label="Achievement" value={`${summary.percentage}%`} color="text-purple-600" />
        <SummaryCard icon={<FaBullseye />} label="Remaining" value={fmt(summary.remaining)} color="text-amber-600" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-bold text-gray-800 mb-4">
          {activeBrand} — Monthly Achieved vs Target ({year})
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="target" name="Target" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="achieved" name="Achieved" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3">Achieved</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthly.map((r) => {
                const pct = r.target > 0 ? Math.round((r.achieved / r.target) * 100) : 0;
                return (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-700">{r.month}</td>
                    <td className="px-6 py-3 font-bold text-gray-800">{fmt(r.achieved)}</td>
                    <td className="px-6 py-3 text-gray-500">{fmt(r.target)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 100
                            ? "bg-emerald-100 text-emerald-700"
                            : pct > 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className={`flex items-center gap-2 mb-1 ${color}`}>
      {icon}
      <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
    </div>
    <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default SalesEarnings;
