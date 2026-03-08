// Client Panel > Subtask Dashboard Container
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import LoadingOverlay from "../components/LoadingOverlay";
import { stageOptions, statusOptions } from "../options";

// ── Badge colour maps ───────────────────────────────────────────────────────
const statusClass = {
  "completed": "bg-green-100 text-green-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "to-do": "bg-gray-100 text-gray-600",
  "blocked": "bg-red-100 text-red-700",
};

const formateDate = (dateString) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
};

// ── Mobile subtask card (read-only) ────────────────────────────────────────
const SubtaskCard = ({ row }) => {
  const t = row.original;
  const sKey = t.status?.toLowerCase().replace(" ", "-") || "default";
  const stages = Array.isArray(t.stages) ? t.stages : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-gray-800 text-sm leading-tight">{t.task_name}</span>
        <Link
          to={`/subtask/view/${t._id}`}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </div>

      {/* status badge */}
      <div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[sKey] || "bg-gray-100 text-gray-600"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {t.status}
        </span>
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

      {/* URL */}
      {t.url && (
        <button
          onClick={(e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) { window.open(t.url, "_blank", "noopener,noreferrer"); return; }
            navigator.clipboard.writeText(t.url).then(() => toast.success("URL copied!")).catch(() => toast.error("Failed to copy."));
          }}
          className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-800 max-w-full"
          title="Click to copy • Ctrl+Click to open"
        >
          <span className="truncate">{t.url}</span>
          <svg className="w-3 h-3 flex-shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="m5 15-4-4 4-4" />
          </svg>
        </button>
      )}
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

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const [subtaskRes, projectRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`),
      ]);
      setProject(projectRes.data.project);

      const normalized = subtaskRes.data.map((t) => {
        const rawStages = t.stages ?? t.stage ?? [];
        const stages = rawStages.map((s) =>
          typeof s === "string"
            ? { name: s, completed: false, completed_by: null, completed_at: null }
            : { name: s.name || s, completed: s.completed || false, completed_by: s.completed_by || null, completed_at: s.completed_at || null }
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
  }, [projectId]); // eslint-disable-line

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!")).catch(() => toast.error("Failed to copy."));
  };

  const columnHelper = createColumnHelper();
  const selectCls = "w-full px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-blue-400 mt-1";

  const columns = useMemo(() => [
    // Subtask Name
    columnHelper.accessor("task_name", {
      header: "Subtask Name",
      cell: (info) => (
        <span className="block max-w-[180px] truncate text-sm font-medium text-gray-800" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
      filterFn: "includesString",
    }),

    // Assign Date
    columnHelper.accessor("assign_date", {
      header: "Assign Date",
      cell: (info) => <span className="text-xs text-gray-600 whitespace-nowrap">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    // Due Date
    columnHelper.accessor("due_date", {
      header: "Due Date",
      cell: (info) => <span className="text-xs text-gray-600 whitespace-nowrap">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    // Stages
    columnHelper.accessor("stages", {
      header: "Stages",
      cell: (info) => {
        const stages = info.getValue();
        if (!Array.isArray(stages) || stages.length === 0)
          return <span className="text-xs text-gray-400">No stages</span>;
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

    // Status
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

    // URL
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

    // Actions — view only
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link
          to={`/subtask/view/${row.original._id}`}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="View"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      ),
      enableSorting: false, enableColumnFilter: false,
    }),
  ], []); // eslint-disable-line

  const table = useReactTable({
    data: subtasks, columns,
    state: { globalFilter, columnFilters, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-gray-800">Project Subtasks</h1>
              {project?.project_name && (
                <p className="text-xs sm:text-sm text-gray-500 truncate">{project.project_name}</p>
              )}
            </div>
          </div>
          {/* Subtask count */}
          <span className="text-sm text-gray-500 flex-shrink-0">
            <span className="font-semibold text-gray-800">{table.getFilteredRowModel().rows.length}</span>
            <span className="text-gray-400"> / {subtasks.length}</span>
          </span>
        </div>
      </div>

      {/* ── Search + Reset ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search across all columns..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              onClick={() => { setGlobalFilter(""); setColumnFilters([]); setSorting([]); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset
            </button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>Show {n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="lg:hidden space-y-3 mb-4">
        {table.getRowModel().rows.length === 0
          ? <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">No subtasks found</div>
          : table.getRowModel().rows.map((row) => <SubtaskCard key={row.id} row={row} />)
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
                      <div className="flex flex-col gap-0.5">
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400 text-xs">
                              {{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ?? "↕"}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {header.column.columnDef.meta?.filterComponent
                              ? <header.column.columnDef.meta.filterComponent column={header.column} />
                              : <input
                                type="text"
                                value={header.column.getFilterValue() ?? ""}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                placeholder="Filter…"
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-md mt-1 focus:ring-1 focus:ring-blue-400"
                              />
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
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">
                    No subtasks found
                  </td>
                </tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            Showing{" "}
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
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

    </div>
  );
};

export default SubtaskDashboardContainer;