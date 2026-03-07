import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const stageBadge = (stage) => {
  const map = {
    "CAD Design": "bg-blue-100 text-blue-800",
    "SET Design": "bg-green-100 text-green-800",
    "Delivery": "bg-yellow-100 text-yellow-800",
    "Render": "bg-purple-100 text-purple-800",
    "QC": "bg-cyan-100 text-cyan-800",
  };
  return map[stage] || "bg-gray-100 text-gray-700";
};

const EmployeeTimeTracking = () => {
  const navigate = useNavigate();
  const { id: employeeId } = useParams();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [openTable, setOpenTable] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [customDateRange, setCustomDateRange] = useState({ from: null, to: null });
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, subRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all-archived`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/employee/tasks/${employeeId}`),
        ]);
        setProjects(projRes.data);
        setSubtasks(subRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (employeeId) fetchData();
  }, [employeeId]);

  const isWithinFilter = (dateStr) => {
    const date = moment(dateStr);
    const now = moment();
    switch (selectedFilter) {
      case "Today": return date.isSame(now, "day");
      case "This Week": return date.isSame(now, "week");
      case "This Month": return date.isSame(now, "month");
      case "Custom":
        if (customDateRange.from && customDateRange.to)
          return date.isBetween(moment(customDateRange.from), moment(customDateRange.to).endOf("day"), null, "[]");
        return false;
      default: return true;
    }
  };

  const calcTimeSpent = (timeLogs) => {
    let total = 0;
    timeLogs?.forEach((log) => {
      if (log.start_time && log.end_time && isWithinFilter(log.start_time))
        total += moment(log.end_time).diff(moment(log.start_time), "seconds");
    });
    return moment.utc(moment.duration(total, "seconds").asMilliseconds()).format("HH:mm:ss");
  };

  const calcRemaining = (dueDate, status) => {
    if (status === "Completed") return "Completed";
    const diff = moment.duration(moment(dueDate).diff(moment()));
    return diff.asMilliseconds() < 0 ? "Overdue" : `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
  };

  const filteredSubtasks = subtasks.filter((s) =>
    s.time_logs?.some((log) => log.start_time && log.end_time && isWithinFilter(log.start_time))
  );

  const totalSecs = filteredSubtasks.reduce((acc, sub) => {
    return acc + (sub.time_logs?.reduce((t, log) => {
      if (log.start_time && log.end_time && isWithinFilter(log.start_time))
        return t + moment(log.end_time).diff(moment(log.start_time), "seconds");
      return t;
    }, 0) || 0);
  }, 0);

  const dur = moment.duration(totalSecs, "seconds");
  const totalTimeFormatted = `${Math.floor(dur.asDays())}d ${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
  const mainTasksCount = new Set(filteredSubtasks.map((s) => s.project_id._id)).size;

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-semibold text-gray-800">Time Tracking</h1>
            <p className="text-xs text-gray-500">Track time spent on tasks and projects</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Main Tasks</p>
          <p className="text-xl font-bold text-gray-800">{mainTasksCount}</p>
          <p className="text-xs text-gray-400">{filteredSubtasks.length} subtasks</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Time</p>
          <p className="text-sm sm:text-base font-bold text-gray-800 break-all">{totalTimeFormatted}</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Time Range</p>
        <div className="flex flex-wrap gap-2">
          {["All Time", "Today", "This Week", "This Month", "Custom"].map((label) => (
            <button key={label}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedFilter === label ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => label === "Custom" ? setShowCustomModal(true) : setSelectedFilter(label)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects accordion */}
      <div className="space-y-3">
        {projects.map((project) => {
          const projectSubtasks = filteredSubtasks.filter((s) => s.project_id._id === project._id);
          if (projectSubtasks.length === 0) return null;

          const projSecs = projectSubtasks.reduce((acc, sub) => {
            return acc + moment.duration(calcTimeSpent(sub.time_logs)).asSeconds();
          }, 0);
          const projDur = moment.duration(projSecs, "seconds");
          const projTime = `${projDur.days()}d ${projDur.hours()}h ${projDur.minutes()}m ${projDur.seconds()}s`;

          return (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setOpenTable((p) => p === project._id ? null : project._id)}>
                <span className="font-medium text-gray-800 text-sm truncate">{project.project_name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{projTime}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openTable === project._id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>

              {openTable === project._id && (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {["Subtask Name", "Stage", "Due Date", "Remaining", "Time Spent"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {projectSubtasks.map((subtask, i) => {
                          const spent = calcTimeSpent(subtask.time_logs);
                          const remaining = calcRemaining(subtask.due_date, subtask.status);
                          return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 max-w-[180px]">
                                <span className="truncate block text-gray-800 font-medium" title={subtask.task_name}>{subtask.task_name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageBadge(subtask.stage)}`}>{subtask.stage}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">{moment(subtask.due_date).format("DD MMM YYYY")}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${remaining === "Completed" ? "bg-green-100 text-green-700"
                                    : remaining === "Overdue" ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}>{remaining}</span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-700">{spent}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden border-t border-gray-100 divide-y divide-gray-50">
                    {projectSubtasks.map((subtask, i) => {
                      const spent = calcTimeSpent(subtask.time_logs);
                      const remaining = calcRemaining(subtask.due_date, subtask.status);
                      return (
                        <div key={i} className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-800 truncate">{subtask.task_name}</p>
                            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${stageBadge(subtask.stage)}`}>{subtask.stage}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>Due: <strong className="text-gray-700">{moment(subtask.due_date).format("DD MMM YYYY")}</strong></span>
                            <span>Time: <strong className="font-mono text-gray-700">{spent}</strong></span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${remaining === "Completed" ? "bg-green-100 text-green-700"
                              : remaining === "Overdue" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>{remaining}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p className="text-xs text-gray-500">
          Showing <strong className="text-gray-800">{mainTasksCount}</strong> main tasks
          ({<strong className="text-gray-800">{filteredSubtasks.length}</strong>} subtasks) ·
          Total: <strong className="text-gray-800">{totalTimeFormatted}</strong>
        </p>
      </div>

      {/* Custom Date Modal (pure Tailwind) */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Select Custom Date Range</h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setCustomDateRange((p) => ({ ...p, from: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setCustomDateRange((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => { setSelectedFilter("Custom"); setShowCustomModal(false); }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTimeTracking;