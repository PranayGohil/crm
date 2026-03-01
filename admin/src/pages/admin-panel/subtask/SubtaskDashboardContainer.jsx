import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import { stageOptions, priorityOptions, statusOptions } from "../../../options";

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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`);
      const projectRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`);
      setProject(projectRes.data.project);
      const normalized = res.data.map((t) => {
        const rawStages = t.stages ?? t.stage ?? [];
        const stages = rawStages.map((s) =>
          typeof s === "string"
            ? { name: s, completed: false, completed_by: null, completed_at: null, price: 0 }
            : { name: s.name || s, completed: s.completed || false, completed_by: s.completed_by || null, completed_at: s.completed_at || null, price: s.price || 0 }
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
      setEmployees(res.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  useEffect(() => {
    fetchSubtasks();
    fetchEmployees();
  }, [projectId]);

  const naturalSort = (rowA, rowB, columnId) => {
    let a = rowA.getValue(columnId);
    let b = rowB.getValue(columnId);
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    a = String(a).toLowerCase();
    b = String(b).toLowerCase();
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    // Selection
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="checkbox-wrapper">
          <input type="checkbox" checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()} className="checkbox-input" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="checkbox-wrapper">
          <input type="checkbox" checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()} className="checkbox-input" />
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),

    // Subtask Name
    columnHelper.accessor("task_name", {
      header: "Subtask Name",
      cell: (info) => (
        <div className="task-name-cell">
          <span className="task-name-text" title={info.getValue()}>{info.getValue()}</span>
        </div>
      ),
      filterFn: "includesString",
      sortingFn: naturalSort,
    }),

    // Assign Date
    columnHelper.accessor("assign_date", {
      header: "Assign Date",
      cell: (info) => <span className="date-cell">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    // Due Date
    columnHelper.accessor("due_date", {
      header: "Due Date",
      cell: (info) => <span className="date-cell">{formateDate(info.getValue())}</span>,
      sortingFn: "datetime",
    }),

    // Priority
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const priority = info.getValue();
        return <span className={`priority-badge priority-${priority?.toLowerCase().replace(" ", "-") || "default"}`}>{priority}</span>;
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className="filter-select">
            <option value="">All</option>
            {priorityOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
          </select>
        ),
      },
    }),

    // Stage
    columnHelper.accessor("stages", {
      header: "Stages",
      cell: (info) => {
        const stages = info.getValue();
        if (!Array.isArray(stages) || stages.length === 0) return <span className="no-data">No stages</span>;
        return (
          <div className="stages-container">
            {stages.map((s, i) => {
              const name = typeof s === "string" ? s : s.name;
              const completed = s?.completed;
              return (
                <div key={i} className="stage-flow">
                  <span className={`stage-badge ${completed ? "completed" : "pending"}`}>
                    {completed && <span className="check-icon">✓</span>}
                    {name}
                  </span>
                  {i < stages.length - 1 && <span className="stage-arrow">→</span>}
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
        return Array.isArray(stages) && stages.some((s) => (typeof s === "string" ? s : s.name) === filterValue);
      },
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className="filter-select">
            <option value="">All</option>
            {stageOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
          </select>
        ),
      },
    }),

    // Status
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={`status-badge status-${status?.toLowerCase().replace(" ", "-") || "default"}`}>
            <span className="status-dot"></span>{status}
          </span>
        );
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className="filter-select">
            <option value="">All</option>
            {statusOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
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
          <div className="url-cell" onClick={(e) => handleCopyToClipboard(url, e)} title="Click to copy • Ctrl+Click to open">
            <span className="url-text">{url}</span>
            <div className="copy-icon-wrapper">
              <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-4-4 4-4"></path>
              </svg>
            </div>
          </div>
        ) : <span className="no-data">No URL</span>;
      },
      enableSorting: false,
    }),

    // Assigned To
    columnHelper.accessor("assign_to", {
      header: "Assigned To",
      cell: (info) => {
        const assignedEmp = employees.find((emp) => emp._id === info.getValue());
        if (!assignedEmp) return <span className="no-data">Unassigned</span>;
        return (
          <div className="assignee-cell">
            {assignedEmp.profile_pic ? (
              <img src={assignedEmp.profile_pic} alt={assignedEmp.full_name} className="assignee-avatar" />
            ) : (
              <div className="assignee-avatar-placeholder">{assignedEmp.full_name?.charAt(0).toUpperCase() || "?"}</div>
            )}
            <span className="assignee-name">{assignedEmp.full_name}</span>
          </div>
        );
      },
      filterFn: "equals",
      meta: {
        filterComponent: ({ column }) => (
          <select value={column.getFilterValue() ?? ""} onChange={(e) => column.setFilterValue(e.target.value || undefined)} className="filter-select">
            <option value="">All</option>
            {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.full_name}</option>)}
          </select>
        ),
      },
    }),

    // ── Total Price column ──
    columnHelper.accessor("total_price", {
      header: "Total (₹)",
      cell: (info) => {
        const val = info.getValue() || 0;
        return val > 0
          ? <span className="text-sm font-medium text-gray-700">₹{val.toLocaleString()}</span>
          : <span className="no-data">—</span>;
      },
      enableColumnFilter: false,
      sortingFn: "basic",
    }),

    // ── Earned column ──
    columnHelper.accessor("earned_amount", {
      header: "Earned (₹)",
      cell: (info) => {
        const val = info.getValue() || 0;
        const total = info.row.original.total_price || 0;
        return val > 0
          ? (
            <div>
              <span className="text-sm font-semibold text-green-700">₹{val.toLocaleString()}</span>
              {total > 0 && (
                <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full"
                    style={{ width: `${Math.round((val / total) * 100)}%` }}></div>
                </div>
              )}
            </div>
          )
          : <span className="no-data">—</span>;
      },
      enableColumnFilter: false,
      sortingFn: "basic",
    }),

    // Actions
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="actions-cell">
          <Link to={`/project/subtask/edit/${row.original._id}`} className="action-btn edit-btn" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
          <button onClick={() => { setSelectedSubtask(row.original._id); setShowDeleteModal(true); }}
            className="action-btn delete-btn" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <Link to={`/subtask/view/${row.original._id}`} className="action-btn view-btn" title="View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </Link>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [employees]);

  const table = useReactTable({
    data: subtasks,
    columns,
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

  const selectedTaskIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => subtasks[parseInt(index)]?._id)
      .filter(Boolean);
  }, [rowSelection, subtasks]);

  const handleBulkUpdateAll = async () => {
    if (selectedTaskIds.length === 0) return;
    const update = {};
    if (bulkAssignTo) update.assign_to = bulkAssignTo;
    if (bulkPriority) update.priority = bulkPriority;
    if (Object.keys(update).length === 0) { toast.info("No changes selected."); return; }
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/subtask/bulk-update`, { ids: selectedTaskIds, update });
      toast.success("Changes applied!");
      fetchSubtasks();
      setBulkAssignTo(""); setBulkPriority(""); setRowSelection({});
    } catch (err) {
      toast.error("Failed to apply changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/subtask/delete/${selectedSubtask}`);
      toast.success("Deleted!");
      fetchSubtasks();
      setShowDeleteModal(false);
    } catch (err) {
      setShowDeleteModal(false);
      toast.error(err.response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkConfirmDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/subtask/bulk-delete`, { ids: selectedTaskIds });
      toast.success("Deleted!");
      fetchSubtasks();
      setRowSelection({});
      setShowBulkDeleteModal(false);
    } catch (err) {
      setShowBulkDeleteModal(false);
      toast.error(err.response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  };

  const handleCopyToClipboard = (url, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL."));
  };

  // ── Pricing summary calculations across all subtasks ──
  const pricingSummary = useMemo(() => {
    const totalValue = subtasks.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const earnedValue = subtasks.reduce((sum, s) => sum + (s.earned_amount || 0), 0);
    const pendingValue = totalValue - earnedValue;
    const percent = totalValue > 0 ? Math.round((earnedValue / totalValue) * 100) : 0;
    return { totalValue, earnedValue, pendingValue, percent };
  }, [subtasks]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="header-title">Project Subtasks</h1>
          </div>
          <p className="project-name">{project?.project_name}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-info">
          <span className="stats-number">{table.getFilteredRowModel().rows.length}</span>
          <span>of {subtasks.length} Subtasks</span>
        </div>
        <Link to={`/project/subtask/add/${projectId}`} className="add-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          New Subtask
        </Link>
      </section>

      {/* ── Pricing Summary Stats ── */}
      {pricingSummary.totalValue > 0 && (
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 mx-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total Contract Value</p>
              <p className="text-lg font-bold text-gray-800">₹{pricingSummary.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
              <p className="text-xs text-green-600 mb-1">Earned So Far</p>
              <p className="text-lg font-bold text-green-700">₹{pricingSummary.earnedValue.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-100">
              <p className="text-xs text-yellow-600 mb-1">Pending</p>
              <p className="text-lg font-bold text-yellow-700">₹{pricingSummary.pendingValue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
              <p className="text-xs text-blue-600 mb-1">Completion</p>
              <p className="text-lg font-bold text-blue-700">{pricingSummary.percent}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${pricingSummary.percent}%` }}></div>
          </div>
        </section>
      )}

      {/* Table - same as before */}
      <section className="table-container">
        <div className="table-controls">
          <div className="controls-left">
            <input type="text" value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="🔍 Search across all columns..." className="search-input" />
            <button className="reset-button" onClick={() => { setGlobalFilter(""); setColumnFilters([]); setSorting([]); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <select value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))} className="page-size-select">
              {[10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>Show {pageSize}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      <div className="header-content-wrapper">
                        <div className={`header-main ${header.column.getCanSort() ? "cursor-pointer" : ""}`}
                          onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="sort-indicator">
                              {{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ?? "↕"}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {header.column.columnDef.meta?.filterComponent ? (
                              <header.column.columnDef.meta.filterComponent column={header.column} />
                            ) : (
                              <input type="text" value={header.column.getFilterValue() ?? ""}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                placeholder="Filter..." className="filter-select" style={{ fontSize: "12px", padding: "4px 6px" }} />
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
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>First</button>
            <button className="pagination-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button>
            <button className="pagination-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
            <button className="pagination-btn" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last</button>
          </div>
        </div>

        {selectedTaskIds.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-header">
              <span className="bulk-count-main">
                <span className="bulk-count">{selectedTaskIds.length}</span> items selected
              </span>
              <div className="bulk-controls">
                <select value={bulkAssignTo} onChange={(e) => setBulkAssignTo(e.target.value)}
                  className="filter-select" style={{ maxWidth: "150px" }}>
                  <option value="">👤 Assign To</option>
                  {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.full_name}</option>)}
                </select>
                <select value={bulkPriority} onChange={(e) => setBulkPriority(e.target.value)}
                  className="filter-select" style={{ maxWidth: "150px" }}>
                  <option value="">⚡ Set Priority</option>
                  {priorityOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                </select>
                <button onClick={handleBulkUpdateAll} className="bulk-btn bulk-btn-primary"
                  disabled={!bulkAssignTo && !bulkPriority}>
                  ✓ Apply Changes
                </button>
                <button className="bulk-btn bulk-btn-danger" onClick={() => setShowBulkDeleteModal(true)}>
                  🗑️ Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this subtask?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBulkDeleteModal} onHide={() => setShowBulkDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{selectedTaskIds.length}</strong> selected subtask(s)?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBulkConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubtaskDashboardContainer;