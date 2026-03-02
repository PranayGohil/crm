// hooks/useEmployeeData.js
// Shared hooks and utilities for all employee pages.
// Import from here instead of copy-pasting across files.

import { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";

// ─── Debounce hook ────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ─── Format milliseconds → "Xd Xh Xm Xs" ────────────────────────────────────
export function formatMs(ms) {
    if (!ms || ms <= 0) return "0h 0m 0s";
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [d > 0 && `${d}d`, `${h}h`, `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

// ─── Remaining time label ─────────────────────────────────────────────────────
export function getRemainingLabel(dueDate, status) {
    if (!dueDate) return { label: "-", type: "default" };
    if (status === "Completed") return { label: "Completed", type: "completed" };
    const diffMs = new Date(dueDate) - new Date();
    if (diffMs < 0) return { label: "Overdue", type: "overdue" };
    const d = Math.floor(diffMs / 86400000);
    const h = Math.floor((diffMs % 86400000) / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return { label: `${d}d ${h}h ${m}m`, type: "pending" };
}

// ─── Stage pills component (shared across pages) ──────────────────────────────
export function StagePills({ stages }) {
    if (!Array.isArray(stages) || !stages.length)
        return <span className="no-data">No stages</span>;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {stages.map((stg, i) => {
                const name = typeof stg === "string" ? stg : stg.name;
                const done = !!stg?.completed;
                return (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <small style={{
                            padding: "3px 8px", borderRadius: 12, fontSize: 11,
                            background: done ? "#e6ffed" : "#f3f4f6",
                            color: done ? "#097a3f" : "#444",
                            border: `1px solid ${done ? "#b7f0c6" : "#e0e0e0"}`,
                        }}>
                            {done && "✓ "}{name}
                        </small>
                        {i < stages.length - 1 && <span style={{ color: "#aaa", fontSize: 12 }}>→</span>}
                    </span>
                );
            })}
        </div>
    );
}

// ─── Time range pill group (shared UI) ────────────────────────────────────────
export const RANGE_OPTIONS = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "custom", label: "Custom" },
];

// ─── Pagination bar ───────────────────────────────────────────────────────────
export function PaginationBar({ pagination, onPageChange, onLimitChange, loading }) {
    const { page, totalPages, limit } = pagination;
    if (totalPages <= 1 && limit === 20) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
        }, []);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 0", flexWrap: "wrap" }}>
            <button className="px-3 py-1 rounded border text-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>← Prev</button>
            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`e${i}`} style={{ color: "#aaa" }}>…</span>
                ) : (
                    <button key={p} onClick={() => onPageChange(p)} disabled={loading}
                        style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ddd", background: p === page ? "#2563eb" : "#fff", color: p === page ? "#fff" : "#374151", cursor: "pointer" }}>
                        {p}
                    </button>
                )
            )}
            <button className="px-3 py-1 rounded border text-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}>Next →</button>
            <select style={{ marginLeft: 16, border: "1px solid #ddd", borderRadius: 4, padding: "4px 8px", fontSize: 13 }}
                value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
        </div>
    );
}

export function CustomDateModal({ show, onHide, dates, onDatesChange, onApply }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Select Custom Date Range</Modal.Title></Modal.Header>
            <Modal.Body>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>From</label>
                        <input type="date" className="form-control" value={dates.from ?? ""}
                            onChange={(e) => onDatesChange((p) => ({ ...p, from: e.target.value }))} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>To</label>
                        <input type="date" className="form-control" value={dates.to ?? ""}
                            onChange={(e) => onDatesChange((p) => ({ ...p, to: e.target.value }))} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" disabled={!dates.from && !dates.to}
                    onClick={() => { onApply(); onHide(); }}>Apply</Button>
            </Modal.Footer>
        </Modal>
    );
}