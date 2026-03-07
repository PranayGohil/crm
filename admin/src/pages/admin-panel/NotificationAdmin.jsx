import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../contexts/SocketContext";

/* ─── constants ──────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: "All", label: "All", icon: "📋" },
  { key: "Task Updates", label: "Tasks", icon: "📝" },
  { key: "Comments", label: "Comments", icon: "💬" },
  { key: "Media Uploads", label: "Media", icon: "📎" },
];

const PAGE_SIZES = [10, 15, 25, 50];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const matchesCategory = (n, key) => {
  if (key === "All") return true;
  if (key === "Task Updates") return n.type === "subtask_updated" || n.type === "task_update";
  if (key === "Comments") return n.type === "comment";
  if (key === "Media Uploads") return n.type === "media_upload";
  return false;
};

const getIcon = (type) =>
  ({ subtask_updated: "📝", task_update: "📝", comment: "💬", overdue: "⏰", deadline: "⏰", media_upload: "📎" }[type] ?? "📋");

const getTypeBadgeClass = (type) => {
  if (type === "subtask_updated" || type === "task_update") return "bg-blue-100 text-blue-800 border-blue-200";
  if (type === "comment") return "bg-green-100 text-green-800 border-green-200";
  if (type === "overdue" || type === "deadline") return "bg-red-100 text-red-800 border-red-200";
  if (type === "media_upload") return "bg-purple-100 text-purple-800 border-purple-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const getViewUrl = (notification) => {
  if (notification.related_id) return `/subtask/view/${notification.related_id}`;
  return "#";
};

const formatTimeAgo = (dateString) => {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
};

/* ─── notification card ──────────────────────────────────────────────────── */
const NotifCard = ({ notification }) => (
  <div className="flex items-start gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group">
    {/* Icon */}
    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-50 rounded-full text-base sm:text-lg border shadow-sm">
      {getIcon(notification.type)}
    </div>

    {/* Body */}
    <div className="flex-1 min-w-0">
      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1 mb-1">
        <p className="font-medium text-gray-900 text-sm leading-snug truncate max-w-full sm:max-w-[60%]">
          {notification.title}
        </p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{notification.description}</p>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeBadgeClass(notification.type)}`}>
            {notification.type?.replace("_", " ")}
          </span>
          {notification.media && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              📎 Media
            </span>
          )}
        </div>
        <a
          href={getViewUrl(notification)}
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </a>
      </div>
    </div>
  </div>
);

/* ─── main ───────────────────────────────────────────────────────────────── */
const NotificationAdmin = () => {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useSocket();

  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState("");

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));
  const adminId = adminUser?._id;

  /* fetch + mark-all-read */
  useEffect(() => {
    if (!adminId) return;
    const run = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("employeeToken")}` };
        const params = { receiver_id: adminId, receiver_type: "admin" };
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notification/get`, { params, headers });
        setNotifications(res.data.notifications);

        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/notification/mark-all-read`,
          { receiver_id: adminId, receiver_type: "admin" },
          { headers }
        );
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Notification fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [adminId, setNotifications]);

  /* reset page when filter/search changes */
  useEffect(() => { setCurrentPage(1); }, [activeFilter, search]);

  /* derived */
  const filtered = notifications.filter((n) => {
    if (!matchesCategory(n, activeFilter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q) ||
      n.type?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  const resetAll = () => { setSearch(""); setActiveFilter("All"); setCurrentPage(1); };

  /* page number pills */
  const pagePills = () => {
    const pills = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pills.push(i);
    return pills;
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="p-5 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm p-10 border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="bg-white rounded-lg px-4 sm:px-6 py-4 mb-3 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">Notification Center</h1>
          </div>

          {/* Quick count badge */}
          {/* <div className="flex-shrink-0 text-right">
            <span className="text-2xl sm:text-3xl font-bold text-blue-700">{filtered.length}</span>
            <p className="text-xs text-gray-400 leading-none mt-0.5">of {notifications.length}</p>
          </div> */}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-white rounded-lg mb-3 shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide bg-gray-50 border-b border-gray-200">

          {FILTERS.map((filter) => {
            const count = notifications.filter((n) =>
              matchesCategory(n, filter.key)
            ).length;

            const active = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-max border-b-2
          
          ${active
                    ? "bg-white text-blue-700 border-blue-700"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <span className="text-base">{filter.icon}</span>

                <span>
                  {filter.label}
                </span>

                <span
                  className={`px-2 py-0.5 text-xs rounded-full hidden sm:inline ${active
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0 overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search notifications..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Reset + Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

              {/* Reset */}
              <button
                onClick={resetAll}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>

              {/* Page + Page Size */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 space-y-2 sm:space-y-3">
          {paginated.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>

              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                No notifications found
              </h3>

              <p className="text-sm text-gray-500">
                {search
                  ? "Try adjusting your search or filters"
                  : `No notifications in ${activeFilter.toLowerCase()} yet`}
              </p>
            </div>
          ) : (
            paginated.map((n) => (
              <NotifCard key={n._id} notification={n} />
            ))
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t px-3 sm:px-5 py-3">
          {/* Entry count */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mb-2 sm:hidden">
            {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-500 hidden sm:block">
              Showing {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}
            </p>

            {/* Page buttons */}
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {/* First / Prev */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed hidden sm:inline-flex"
              >First</button>
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >← Prev</button>

              {/* Page pills */}
              {pagePills().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-md ${p === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                    }`}
                >{p}</button>
              ))}

              {/* Next / Last */}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >Next →</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed hidden sm:inline-flex"
              >Last</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationAdmin;