// Updated with Complete UI (No Bulk Operations)
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import LoadingOverlay from "../components/LoadingOverlay";
import { stageOptions, statusOptions } from "../options";

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

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
      );
      const projectRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
      );
      setProject(projectRes.data.project);

      const normalized = res.data.map((t) => {
        const rawStages = t.stages ?? t.stage ?? [];
        const stages = rawStages.map((s) =>
          typeof s === "string"
            ? {
                name: s,
                completed: false,
                completed_by: null,
                completed_at: null,
              }
            : {
                name: s.name || s,
                completed: s.completed || false,
                completed_by: s.completed_by || s.completedBy || null,
                completed_at: s.completed_at || s.completedAt || null,
              }
        );
        return { ...t, stages };
      });
      setSubtasks(normalized);
    } catch (error) {
      console.error("Failed to fetch subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/employee/get-all`
      );
      setEmployees(res.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  useEffect(() => {
    fetchSubtasks();
    fetchEmployees();
  }, [projectId]);

  // Column helper
  const columnHelper = createColumnHelper();

  // Define columns (without selection column)
  const columns = useMemo(
    () => [
      // Subtask Name
      columnHelper.accessor("task_name", {
        header: "Subtask Name",
        cell: (info) => (
          <div className="task-name-cell">
            <span className="task-name-text" title={info.getValue()}>
              {info.getValue()}
            </span>
          </div>
        ),
        filterFn: "includesString",
      }),

      // Assign Date
      columnHelper.accessor("assign_date", {
        header: "Assign Date",
        cell: (info) => (
          <span className="date-cell">{formateDate(info.getValue())}</span>
        ),
        sortingFn: "datetime",
      }),

      // Due Date
      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) => (
          <span className="date-cell">{formateDate(info.getValue())}</span>
        ),
        sortingFn: "datetime",
      }),

      // Stage
      columnHelper.accessor("stages", {
        header: "Stages",
        cell: (info) => {
          const stages = info.getValue();
          if (!Array.isArray(stages) || stages.length === 0) {
            return <span className="no-data">No stages</span>;
          }

          return (
            <div className="stages-container">
              {stages.map((s, i) => {
                const name = typeof s === "string" ? s : s.name;
                const completed = s?.completed;
                return (
                  <div key={i} className="stage-flow">
                    <span
                      className={`stage-badge ${
                        completed ? "completed" : "pending"
                      }`}
                    >
                      {completed && <span className="check-icon">✓</span>}
                      {name}
                    </span>
                    {i < stages.length - 1 && (
                      <span className="stage-arrow">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        },
        enableSorting: false,
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true;
          const stages = row.getValue(columnId);
          return (
            Array.isArray(stages) &&
            stages.some(
              (s) => (typeof s === "string" ? s : s.name) === filterValue
            )
          );
        },
        meta: {
          filterComponent: ({ column }) => (
            <select
              value={column.getFilterValue() ?? ""}
              onChange={(e) =>
                column.setFilterValue(e.target.value || undefined)
              }
              className="filter-select"
            >
              <option value="">All</option>
              {stageOptions.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ),
        },
      }),

      // Status
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusClass =
            status?.toLowerCase().replace(" ", "-") || "default";
          return (
            <span className={`status-badge status-${statusClass}`}>
              <span className="status-dot"></span>
              {status}
            </span>
          );
        },
        filterFn: "equals",
        meta: {
          filterComponent: ({ column }) => (
            <select
              value={column.getFilterValue() ?? ""}
              onChange={(e) =>
                column.setFilterValue(e.target.value || undefined)
              }
              className="filter-select"
            >
              <option value="">All</option>
              {statusOptions.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
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
            <div
              className="url-cell"
              onClick={(e) => handleCopyToClipboard(url, e)}
              title="Click to copy • Ctrl+Click to open"
            >
              <span className="url-text">{url}</span>
              <div className="copy-icon-wrapper">
                <svg
                  className="copy-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="m5 15-4-4 4-4"></path>
                </svg>
              </div>
            </div>
          ) : (
            <span className="no-data">No URL</span>
          );
        },
        enableSorting: false,
      }),

      // Actions
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="actions-cell">
            <Link
              to={`/subtask/view/${row.original._id}`}
              className="action-btn view-btn"
              title="View"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Link>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      }),
    ],
    [employees]
  );

  // Create table instance (without row selection)
  const table = useReactTable({
    data: subtasks,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">Project Subtasks</h1>
          </div>
          <p className="project-name">{project?.project_name}</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">
            {table.getFilteredRowModel().rows.length}
          </span>
          <span>of {subtasks.length} Subtasks</span>
        </div>
      </section>

      {/* Table Container */}
      <section className="table-container">
        {/* Table Controls */}
        <div className="table-controls">
          <div className="controls-left">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="🔍 Search across all columns..."
              className="search-input"
            />
            <button
              className="reset-button"
              onClick={() => {
                setGlobalFilter("");
                setColumnFilters([]);
                setSorting([]);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Reset All
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span className="pagination-info">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="page-size-select"
            >
              {[10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      <div className="header-content-wrapper">
                        <div
                          className={`header-main ${
                            header.column.getCanSort() ? "cursor-pointer" : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="sort-indicator">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted()] ?? "↕"}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {header.column.columnDef.meta?.filterComponent ? (
                              <header.column.columnDef.meta.filterComponent
                                column={header.column}
                              />
                            ) : (
                              <input
                                type="text"
                                value={header.column.getFilterValue() ?? ""}
                                onChange={(e) =>
                                  header.column.setFilterValue(e.target.value)
                                }
                                placeholder="Filter..."
                                className="filter-select"
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 6px",
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </button>
            <button
              className="pagination-btn"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="pagination-btn"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
            <button
              className="pagination-btn"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubtaskDashboardContainer;