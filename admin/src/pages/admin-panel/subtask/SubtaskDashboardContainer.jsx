import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { stageOptions, priorityOptions, statusOptions } from "../../../options";

// ── Reusable confirm modal ──────────────────────────────────────────────────
const ConfirmModal = ({ show, title, children, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Priority badge colours ──────────────────────────────────────────────────
const priorityClass = {
  high: "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  low: "bg-green-100 text-green-700 border border-green-200",
};
const statusClass = {
  completed: "bg-green-100 text-green-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "to-do": "bg-gray-100 text-gray-600",
  blocked: "bg-red-100 text-red-700",
};

const formateDate = (dateString) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
};

// ── Mobile subtask card ─────────────────────────────────────────────────────
const SubtaskCard = ({ row, employees, onDelete }) => {
  const t = row.original;
  const assignee = employees.find((e) => e._id === t.assign_to);
  const pKey = t.priority?.toLowerCase().replace(" ", "-") || "default";
  const sKey = t.status?.toLowerCase().replace(" ", "-") || "default";
  const stages = Array.isArray(t.stages) ? t.stages : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()}
            className="flex-shrink-0 w-4 h-4 accent-blue-600" />
          <span className="font-medium text-gray-800 text-sm leading-tight">{t.task_name}</span>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Link to={`/subtask/view/${t._id}`} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
          <Link to={`/project/subtask/edit/${t._id}`} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
          <button onClick={() => onDelete(t._id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[pKey] || "bg-gray-100 text-gray-600"}`}>{t.priority}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[sKey] || "bg-gray-100 text-gray-600"}`}>{t.status}</span>
      </div>

      {/* dates */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>📅 {formateDate(t.assign_date)}</span>
        <span>⏰ {formateDate(t.due_date)}</span>
      </div>

      {/* stages */}
      {stages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {stages.map((s, i) => {
            const name = typeof s === "string" ? s : s.name;
            const done = s?.completed;
            return (
              <span key={i} className={`px-2 py-0.5 rounded-full text-xs border ${done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {done && "✓ "}{name}
              </span>
            );
          })}
        </div>
      )}

      {/* assignee + pricing */}
      <div className="flex items-center justify-between text-sm">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            {assignee.profile_pic
              ? <img src={assignee.profile_pic} alt="" className="w-6 h-6 rounded-full object-cover" />
              : <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{assignee.full_name?.charAt(0).toUpperCase()}</div>
            }
            <span className="text-gray-700 text-xs">{assignee.full_name}</span>
          </div>
        ) : <span className="text-xs text-gray-400">Unassigned</span>}

        {(t.total_price > 0 || t.earned_amount > 0) && (
          <div className="text-right text-xs">
            {t.total_price > 0 && <span className="text-gray-500">₹{t.total_price?.toLocaleString()}</span>}
            {t.earned_amount > 0 && <span className="text-green-600 font-medium ml-2">₹{t.earned_amount?.toLocaleString()} earned</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const SubtaskDashboardContainer = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const [bulkAssignTo, setBulkAssignTo] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const [subtaskRes, projectRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`),
      ]);
      setProject(projectRes.data.project);
      const normalized = subtaskRes.data.map((t) => {
        const raw = t.stages ?? t.stage ?? [];
        const stages = raw.map((s) =>
          typeof s === "string"
            ? { name: s, completed: false, completed_by: null, completed_at: null, price: 0 }
            : { name: s.name || s, completed: s.completed || false, completed_by: s.completed_by || null, completed_at: s.completed_at || null, price: s.price || 0 }
        );
        return { ...t, stages };
      });
      setSubtasks(normalized);
    } catch (err) {
      console.error("Failed to fetch subtasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
    axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`)
      .then((r) => setEmployees(r.data))
      .catch(console.error);
  }, [projectId]); // eslint-disable-line

  const naturalSort = (rowA, rowB, columnId) => {
    let a = rowA.getValue(columnId), b = rowB.getValue(columnId);
    if (a == null && b == null) return 0;
    if (a == null) return 1; if (b == null) return -1;
    return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), undefined, { numeric: true, sensitivity: "base" });
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!")).catch(() => toast.error("Failed to copy."));
  };

  const columnHelper = createColumnHelper();
  const selectCls = "w-full px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-blue-400 mt-1";

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4 accent-blue-600" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 accent-blue-600" />
      ),
      enableSorting: false, enableColumnFilter: false,
    }),

    columnHelper.accessor("task_name", {
      header: "Subtask Name",
      cell: (info) => (
        <span className="block max-w-[180px] truncate text-sm font-medium text-gray-800" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
      filterFn: "includesString", sortingFn: naturalSort,
    }),

    columnHelper.accessor("assign_date", {
      header: "Assign Date",
      cell: (info) => <span className="text-xs text-gray-600 whitespace-nowrap">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    columnHelper.accessor("due_date", {
      header: "Due Date",
      cell: (info) => <span className="text-xs text-gray-600 whitespace-nowrap">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const p = info.getValue();
        const k = p?.toLowerCase().replace(" ", "-") || "default";
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${priorityClass[k] || "bg-gray-100 text-gray-600"}`}>{p}</span>;
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className={selectCls}>
            <option value="">All</option>
            {priorityOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        ),
      },
    }),

    columnHelper.accessor("stages", {
      header: "Stages",
      cell: (info) => {
        const stages = info.getValue();
        if (!Array.isArray(stages) || stages.length === 0) return <span className="text-xs text-gray-400">No stages</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {stages.map((s, i) => {
              const name = typeof s === "string" ? s : s.name;
              const done = s?.completed;
              return (
                <span key={i} className={`px-1.5 py-0.5 rounded text-xs border ${done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {done && "✓ "}{name}
                </span>
              );
            })}
          </div>
        );
      },
      enableSorting: false,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const stages = row.getValue(columnId);
        return Array.isArray(stages) && stages.some((s) => (typeof s === "string" ? s : s.name) === filterValue);
      },
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className={selectCls}>
            <option value="">All</option>
            {stageOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        ),
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const s = info.getValue();
        const k = s?.toLowerCase().replace(" ", "-") || "default";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusClass[k] || "bg-gray-100 text-gray-600"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{s}
          </span>
        );
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className={selectCls}>
            <option value="">All</option>
            {statusOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        ),
      },
    }),

    columnHelper.accessor("url", {
      header: "URL",
      cell: (info) => {
        const url = info.getValue();
        return url ? (
          <button onClick={(e) => handleCopyToClipboard(url, e)}
            title="Click to copy • Ctrl+Click to open"
            className="flex items-center gap-1 max-w-[140px] text-blue-600 hover:text-blue-800 group">
            <span className="text-xs truncate">{url}</span>
            <svg className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="m5 15-4-4 4-4" />
            </svg>
          </button>
        ) : <span className="text-xs text-gray-400">No URL</span>;
      },
      enableSorting: false,
    }),

    columnHelper.accessor("assign_to", {
      header: "Assigned To",
      cell: (info) => {
        const emp = employees.find((e) => e._id === info.getValue());
        if (!emp) return <span className="text-xs text-gray-400">Unassigned</span>;
        return (
          <div className="flex items-center gap-1.5">
            {emp.profile_pic
              ? <img src={emp.profile_pic} alt={emp.full_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              : <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{emp.full_name?.charAt(0).toUpperCase()}</div>
            }
            <span className="text-xs text-gray-700 whitespace-nowrap">{emp.full_name}</span>
          </div>
        );
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className={selectCls}>
            <option value="">All</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
          </select>
        ),
      },
    }),

    columnHelper.accessor("total_price", {
      header: "Total (₹)",
      cell: (info) => {
        const v = info.getValue() || 0;
        return v > 0
          ? <span className="text-xs font-medium text-gray-700 whitespace-nowrap">₹{v.toLocaleString()}</span>
          : <span className="text-xs text-gray-400">—</span>;
      },
      enableColumnFilter: false, sortingFn: "basic",
    }),

    columnHelper.accessor("earned_amount", {
      header: "Earned (₹)",
      cell: (info) => {
        const v = info.getValue() || 0;
        const total = info.row.original.total_price || 0;
        return v > 0 ? (
          <div>
            <span className="text-xs font-semibold text-green-700 whitespace-nowrap">₹{v.toLocaleString()}</span>
            {total > 0 && (
              <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min(Math.round((v / total) * 100), 100)}%` }} />
              </div>
            )}
          </div>
        ) : <span className="text-xs text-gray-400">—</span>;
      },
      enableColumnFilter: false, sortingFn: "basic",
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <Link to={`/subtask/view/${row.original._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
          <Link to={`/project/subtask/edit/${row.original._id}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Edit">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
          <button onClick={() => { setSelectedSubtask(row.original._id); setShowDeleteModal(true); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2" />
            </svg>
          </button>
        </div>
      ),
      enableSorting: false, enableColumnFilter: false,
    }),
  ], [employees]); // eslint-disable-line

  const table = useReactTable({
    data: subtasks, columns,
    state: { globalFilter, columnFilters, sorting, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const selectedTaskIds = useMemo(() =>
    Object.keys(rowSelection).filter((k) => rowSelection[k]).map((i) => subtasks[parseInt(i)]?._id).filter(Boolean),
    [rowSelection, subtasks]
  );

  const handleBulkUpdateAll = async () => {
    if (selectedTaskIds.length === 0) return;
    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;
    if (bulkPriority) update.priority = bulkPriority;
    if (!Object.keys(update).length) { toast.info("No changes selected."); return; }
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/subtask/bulk-update`, { ids: selectedTaskIds, update }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Changes applied!");
      fetchSubtasks(); setBulkAssignTo(""); setBulkPriority(""); setRowSelection({});
    } catch { toast.error("Failed to apply changes."); }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/subtask/delete/${selectedSubtask}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Deleted!"); fetchSubtasks(); setShowDeleteModal(false);
    } catch (err) { setShowDeleteModal(false); toast.error(err.response?.data?.message || ""); }
    finally { setLoading(false); }
  };

  const handleBulkConfirmDelete = async () => {
    if (!selectedTaskIds.length) return;
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/subtask/bulk-delete`, { ids: selectedTaskIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Deleted!"); fetchSubtasks(); setRowSelection({}); setShowBulkDeleteModal(false);
    } catch (err) { setShowBulkDeleteModal(false); toast.error(err.response?.data?.message || ""); }
    finally { setLoading(false); }
  };

  const pricingSummary = useMemo(() => {
    const totalValue = subtasks.reduce((s, t) => s + (t.total_price || 0), 0);
    const earnedValue = subtasks.reduce((s, t) => s + (t.earned_amount || 0), 0);
    return {
      totalValue, earnedValue, pendingValue: totalValue - earnedValue,
      percent: totalValue > 0 ? Math.round((earnedValue / totalValue) * 100) : 0
    };
  }, [subtasks]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-gray-800">Project Subtasks</h1>
              {project?.project_name && <p className="text-xs sm:text-sm text-gray-500 truncate">{project.project_name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{table.getFilteredRowModel().rows.length}</span>
              <span className="text-gray-400"> / {subtasks.length}</span>
            </span>
            <Link to={`/project/subtask/add/${projectId}`}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
              <span className="hidden sm:inline">New Subtask</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Pricing Summary ── */}
      {pricingSummary.totalValue > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: "Total Value", value: `₹${pricingSummary.totalValue.toLocaleString()}`, cls: "bg-gray-50 border-gray-200 text-gray-800" },
              { label: "Earned", value: `₹${pricingSummary.earnedValue.toLocaleString()}`, cls: "bg-green-50 border-green-100 text-green-700" },
              { label: "Pending", value: `₹${pricingSummary.pendingValue.toLocaleString()}`, cls: "bg-yellow-50 border-yellow-100 text-yellow-700" },
              { label: "Completion", value: `${pricingSummary.percent}%`, cls: "bg-blue-50 border-blue-100 text-blue-700" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`p-3 rounded-xl border text-center ${cls}`}>
                <p className="text-xs opacity-70 mb-0.5">{label}</p>
                <p className="text-base sm:text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pricingSummary.percent}%` }} />
          </div>
        </div>
      )}

      {/* ── Search + Reset ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search across all columns..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              onClick={() => { setGlobalFilter(""); setColumnFilters([]); setSorting([]); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
              </svg>
              Reset
            </button>
            <select value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>Show {n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="lg:hidden space-y-3 mb-4">
        {table.getRowModel().rows.length === 0
          ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">No subtasks found</div>
          : table.getRowModel().rows.map((row) => (
            <SubtaskCard key={row.id} row={row} employees={employees}
              onDelete={(id) => { setSelectedSubtask(id); setShowDeleteModal(true); }} />
          ))
        }
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-3 py-3 text-left">
                      <div className={`flex flex-col gap-0.5 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}>
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                          onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400 text-xs">{{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ?? "↕"}</span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {header.column.columnDef.meta?.filterComponent
                              ? <header.column.columnDef.meta.filterComponent column={header.column} />
                              : <input type="text" value={header.column.getFilterValue() ?? ""}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                placeholder="Filter…"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md mt-1 focus:ring-1 focus:ring-blue-400" />
                            }
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">No subtasks found</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${row.getIsSelected() ? "bg-blue-50" : ""}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
            {" "}of {table.getFilteredRowModel().rows.length} entries
          </p>
          <div className="flex gap-1.5 order-1 sm:order-2">
            {[
              { label: "«", action: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
              { label: "‹", action: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
              { label: "›", action: () => table.nextPage(), disabled: !table.getCanNextPage() },
              { label: "»", action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                className="w-8 h-8 flex items-center justify-center text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {label}
              </button>
            ))}
            <span className="flex items-center px-3 text-xs text-gray-500">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bulk Actions ── */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium flex-shrink-0">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-1">{selectedTaskIds.length}</span>
                selected
              </span>
              <select value={bulkAssignTo} onChange={(e) => setBulkAssignTo(e.target.value)}
                className="flex-1 min-w-[120px] px-2 py-1.5 text-xs bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500">
                <option value="">👤 Assign To</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.full_name}</option>)}
              </select>
              <select value={bulkPriority} onChange={(e) => setBulkPriority(e.target.value)}
                className="flex-1 min-w-[120px] px-2 py-1.5 text-xs bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500">
                <option value="">⚡ Priority</option>
                {priorityOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
              </select>
              <button onClick={handleBulkUpdateAll} disabled={!bulkAssignTo && !bulkPriority}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors whitespace-nowrap">
                ✓ Apply
              </button>
              <button onClick={() => setShowBulkDeleteModal(true)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <ConfirmModal show={showDeleteModal} title="Delete Subtask"
        onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)}>
        Are you sure you want to delete this subtask?
      </ConfirmModal>

      <ConfirmModal show={showBulkDeleteModal} title="Delete Selected Subtasks"
        onConfirm={handleBulkConfirmDelete} onCancel={() => setShowBulkDeleteModal(false)}>
        Are you sure you want to delete <strong>{selectedTaskIds.length}</strong> subtask(s)?
      </ConfirmModal>
    </div>
  );
};

export default SubtaskDashboardContainer;