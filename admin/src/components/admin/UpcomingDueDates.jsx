import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import { Link } from "react-router-dom";

const UpcomingDueDates = () => {
  const [loading, setLoading] = useState(false);
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/statistics/upcoming-due-dates`)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          const dA = a.project_id?.due_date ? new Date(a.project_id.due_date) : new Date(0);
          const dB = b.project_id?.due_date ? new Date(b.project_id.due_date) : new Date(0);
          return dA - dB;
        });
        setDueTasks(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return null;
    const diff = new Date(dueDateStr) - new Date();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const getDaysBadge = (days) => {
    if (days === null) return { bg: "bg-gray-100 text-gray-600 border-gray-200", label: "N/A" };
    if (days < 7) return { bg: "bg-red-50 text-red-600 border-red-200", label: `${days}d left` };
    if (days < 14) return { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", label: `${days}d left` };
    return { bg: "bg-green-50 text-green-700 border-green-200", label: `${days}d left` };
  };

  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();
    if (s.includes("complete")) return "bg-green-100 text-green-800";
    if (s.includes("progress")) return "bg-blue-100 text-blue-800";
    if (s.includes("pending")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) return <LoadingOverlay />;

  const visibleTasks = dueTasks.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">Upcoming Due Dates</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {dueTasks.length}
          </span>
        </div>
        <Link
          to="/subtask/upcoming-due-dates"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          View All
        </Link>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm font-medium">No upcoming due tasks</p>
        </div>
      ) : (
        <>
          {/* Desktop table — hidden on small screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Project", "Task", "Task Due", "Project Due", "Assigned To", "Days Left", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleTasks.map((task, i) => {
                  const days = getDaysRemaining(task.due_date);
                  const daysBadge = getDaysBadge(days);
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 max-w-[140px]">
                        <span className="font-medium text-gray-800 truncate block" title={task.project_id?.project_name}>
                          {task.project_id?.project_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[140px]">
                        <span className="text-gray-700 truncate block" title={task.task_name}>
                          {task.task_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(task.due_date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(task.project_id?.due_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {task.assign_to?.profile_pic ? (
                            <img src={task.assign_to.profile_pic} alt="" className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {task.assign_to?.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="text-gray-700 truncate max-w-[90px]">{task.assign_to?.full_name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${daysBadge.bg}`}>
                          {daysBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                          {task.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — visible only on small screens */}
          <div className="md:hidden divide-y divide-gray-100">
            {visibleTasks.map((task, i) => {
              const days = getDaysRemaining(task.due_date);
              const daysBadge = getDaysBadge(days);
              return (
                <div key={i} className="p-4 flex flex-col gap-2">
                  {/* Top row: project name + days badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Project</p>
                      <p className="font-semibold text-gray-800 text-sm truncate">{task.project_id?.project_name || "N/A"}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${daysBadge.bg}`}>
                      {daysBadge.label}
                    </span>
                  </div>

                  {/* Task name */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Task</p>
                    <p className="text-sm text-gray-700">{task.task_name || "N/A"}</p>
                  </div>

                  {/* Dates + assignee row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>Task due: <strong className="text-gray-700">{formatDate(task.due_date)}</strong></span>
                    <span>Project due: <strong className="text-gray-700">{formatDate(task.project_id?.due_date)}</strong></span>
                  </div>

                  {/* Assignee + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {task.assign_to?.profile_pic ? (
                        <img src={task.assign_to.profile_pic} alt="" className="w-5 h-5 rounded-full border border-gray-200" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {task.assign_to?.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-xs text-gray-600">{task.assign_to?.full_name || "Unassigned"}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                      {task.status || "N/A"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default UpcomingDueDates;