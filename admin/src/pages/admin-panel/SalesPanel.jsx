// src/pages/admin-panel/SalesPanel.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { BRANDS, SALES_PERMISSIONS } from "../../constants";
import {
  FaChartLine,
  FaBullseye,
  FaCalendarAlt,
  FaHistory,
  FaExchangeAlt,
  FaPlus,
  FaSave,
  FaCheckCircle,
  FaListUl,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import SearchableSelect from "../../components/common/SearchableSelect";

const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

const SalesPanel = () => {
  const { user } = useAuth();

  // Determine available brands based on permissions
  const availableBrands = useMemo(() => {
    if (user?.role === "super-admin") return BRANDS;
    const perms = user?.sales_permissions || [];
    const brands = [];
    if (perms.includes(SALES_PERMISSIONS.MUKHWAS)) brands.push("Mukhwas");
    if (perms.includes(SALES_PERMISSIONS.BREELIQ)) brands.push("Breeliq");
    return brands;
  }, [user]);

  const [activeBrand, setActiveBrand] = useState(availableBrands[0] || "");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  // Analytics & Target state
  const [analytics, setAnalytics] = useState({
    achieved: 0,
    target: 0,
    remaining: 0,
    percentage: 0,
    avgDaily: 0,
  });
  const [history, setHistory] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit entry modal state
  const [editingEntry, setEditingEntry] = useState(null);
  const [editData, setEditData] = useState({ amount: "", date: "", notes: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [saleData, setSaleData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [targetAmount, setTargetAmount] = useState("");
  const [savingSale, setSavingSale] = useState(false);
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    if (activeBrand) {
      fetchData();
    }
  }, [activeBrand, month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, historyRes, allRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/sales/analytics`, {
          params: { brand: activeBrand, month, year },
          headers,
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/sales/entries`, {
          params: { brand: activeBrand, month, year, limit: 5 },
          headers,
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/sales/entries`, {
          params: { brand: activeBrand, month, year, limit: 100 },
          headers,
        }),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
        setTargetAmount(analyticsRes.data.analytics.target || "");
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.entries);
      }
      if (allRes.data.success) {
        setAllEntries(allRes.data.entries);
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setSavingSale(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sales/entry`,
        { ...saleData, brand: activeBrand },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success("Sales entry added");
        setSaleData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding sale");
    } finally {
      setSavingSale(false);
    }
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    setSavingTarget(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sales/target`,
        { brand: activeBrand, month, year, target_amount: targetAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success("Target updated");
        fetchData();
      }
    } catch (err) {
      toast.error("Error updating target");
    } finally {
      setSavingTarget(false);
    }
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setEditData({
      amount: entry.amount,
      date: new Date(entry.date).toISOString().split("T")[0],
      notes: entry.notes || "",
    });
  };

  const closeEditModal = () => {
    setEditingEntry(null);
    setEditData({ amount: "", date: "", notes: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEntry) return;
    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/sales/entry/${editingEntry._id}`,
        { ...editData, brand: activeBrand },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        toast.success("Sales entry updated");
        closeEditModal();
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating entry");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm("Are you sure you want to delete this sales entry?"))
      return;
    setDeletingId(entry._id);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/sales/entry/${entry._id}`,
        {
          params: { brand: activeBrand },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        toast.success("Sales entry deleted");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting entry");
    } finally {
      setDeletingId(null);
    }
  };

  if (availableBrands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">
            You don't have permission to manage any sales brand.
          </p>
        </div>
      </div>
    );
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header with Brand Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <FaChartLine size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Sales Panel
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Manage daily sales and targets for your brands
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month/Year selector */}
            <div className="flex items-center gap-2 rounded-lg">
              <div className="w-28">
                <SearchableSelect
                  value={{ value: month, label: monthNames[month] }}
                  onChange={(opt) => setMonth(Number(opt.value))}
                  options={monthNames.map((m, i) => ({ value: i, label: m }))}
                  isClearable={false}
                />
              </div>
              <div className="w-24">
                <SearchableSelect
                  value={{ value: year, label: year }}
                  onChange={(opt) => setYear(Number(opt.value))}
                  options={[2024, 2025, 2026].map((y) => ({
                    value: y,
                    label: y,
                  }))}
                  isClearable={false}
                />
              </div>
            </div>

            {/* Brand Switcher - Only show if user has both permissions or is super-admin */}
            {availableBrands.length > 1 && (
              <div className="relative">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                  <FaExchangeAlt size={12} />
                  <div className="w-32">
                    <SearchableSelect
                      value={{ value: activeBrand, label: activeBrand }}
                      onChange={(opt) => setActiveBrand(opt.value)}
                      options={availableBrands.map((b) => ({
                        value: b,
                        label: b,
                      }))}
                      isClearable={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {availableBrands.length === 1 && (
              <div className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 text-sm">
                Brand: {activeBrand}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
            Total Achieved
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-800">
              {fmt(analytics.achieved)}
            </h3>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
              This Month
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
            Monthly Target
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            {fmt(analytics.target)}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
            Remaining
          </p>
          <h3 className="text-2xl font-bold text-red-600">
            {fmt(analytics.remaining)}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
            Avg. Daily Sales
          </p>
          <h3 className="text-2xl font-bold text-blue-600">
            {fmt(analytics.avgDaily)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-2">
              <FaPlus className="text-white" />
              <h3 className="text-white font-bold">Daily Sales Entry</h3>
            </div>
            <form onSubmit={handleSaleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={saleData.date}
                    onChange={(e) =>
                      setSaleData({ ...saleData, date: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  value={saleData.amount}
                  onChange={(e) =>
                    setSaleData({ ...saleData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Add any specific details..."
                  value={saleData.notes}
                  onChange={(e) =>
                    setSaleData({ ...saleData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={savingSale}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {savingSale ? (
                  "Saving..."
                ) : (
                  <>
                    <FaSave /> Save Entry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Monthly Target Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBullseye className="text-red-500" />
                <h3 className="font-bold text-gray-800">
                  Monthly Target Progress
                </h3>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {monthNames[month]} {year}
              </span>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Current Achievement
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {fmt(analytics.achieved)}{" "}
                      <span className="text-sm font-normal text-gray-400">
                        / {fmt(analytics.target)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      {analytics.percentage}%
                    </p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Achieved
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner border border-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                      analytics.percentage >= 100
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : analytics.percentage >= 50
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : "bg-gradient-to-r from-orange-400 to-orange-600"
                    }`}
                    style={{ width: `${Math.min(100, analytics.percentage)}%` }}
                  ></div>
                </div>
                {analytics.percentage >= 100 && (
                  <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
                    <FaCheckCircle /> Target Completed! Excellent work.
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-tight">
                  Set Monthly Target
                </h4>
                <form onSubmit={handleTargetSubmit} className="flex gap-3">
                  <input
                    type="number"
                    required
                    placeholder="Target Amount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingTarget}
                    className="px-6 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-70"
                  >
                    {savingTarget ? "Updating..." : "Update Target"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* View & Edit Entries Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaListUl className="text-gray-500" />
                <h3 className="font-bold text-gray-800">Manage Entries</h3>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {allEntries.length} {allEntries.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Created By</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allEntries.length > 0 ? (
                    allEntries.map((entry) => (
                      <tr
                        key={entry._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                          {new Date(entry.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                          {fmt(entry.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {entry.created_by?.username || "System"}
                        </td>
                        <td
                          className="px-6 py-4 text-gray-400 italic truncate max-w-[150px]"
                          title={entry.notes}
                        >
                          {entry.notes || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(entry)}
                              title="Edit entry"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry)}
                              disabled={deletingId === entry._id}
                              title="Delete entry"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-400 italic"
                      >
                        No entries found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Entries Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <FaHistory className="text-gray-500" />
              <h3 className="font-bold text-gray-800">Recent Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Created By</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <tr
                        key={entry._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                          {new Date(entry.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                          {fmt(entry.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {entry.created_by?.username || "System"}
                        </td>
                        <td
                          className="px-6 py-4 text-gray-400 italic truncate max-w-[150px]"
                          title={entry.notes}
                        >
                          {entry.notes || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-400 italic"
                      >
                        No entries found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaEdit className="text-white" />
                <h3 className="text-white font-bold">Edit Sales Entry</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={editData.date}
                    onChange={(e) =>
                      setEditData({ ...editData, date: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData({ ...editData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Add any specific details..."
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {savingEdit ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaSave /> Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPanel;
