import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const SubtaskLogs = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subtask, setSubtask] = useState(null);
  const [employees, setEmployees] = useState({});

  useEffect(() => {
    const fetchSubtaskData = async () => {
      try {
        setLoading(true);
        const subtaskRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`);
        setSubtask(subtaskRes.data);
        const employeesRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
        const empMap = {};
        employeesRes.data.forEach((emp) => { empMap[emp._id] = emp; });
        setEmployees(empMap);
      } catch (error) {
        console.error("Error fetching subtask data:", error);
        toast.error("Failed to load subtask logs");
      } finally {
        setLoading(false);
      }
    };
    fetchSubtaskData();
  }, [subtaskId]);

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unknown";
    return employees[employeeId]?.full_name || "Unknown";
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";
    const diff = (endTime ? dayjs(endTime) : dayjs()).diff(dayjs(startTime));
    const dur = dayjs.duration(diff);
    const hours = dur.hours();
    const minutes = dur.minutes();
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const sortedTimeLogs = subtask?.time_logs
    ? [...subtask.time_logs].sort((a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0))
    : [];

  const sortedCompletedStages = subtask?.stages
    ? subtask.stages.filter((s) => s.completed).sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
    : [];

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <div>Subtask not found</div>;

  const totalPrice = subtask.total_price || 0;
  const earnedAmount = subtask.earned_amount || 0;
  const pendingAmount = totalPrice - earnedAmount;
  const earningPercent = totalPrice > 0 ? Math.round((earnedAmount / totalPrice) * 100) : 0;

  const stagesOldestFirst = [...sortedCompletedStages].reverse();
  let runningTotal = 0;
  const stagesWithCumulative = stagesOldestFirst.map((stage) => {
    runningTotal += stage.price || 0;
    return { ...stage, cumulativeEarned: runningTotal };
  });
  const stagesForDisplay = [...stagesWithCumulative].reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg mr-3 sm:mr-4 hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Subtask Logs</h1>
            <p className="text-gray-600 text-sm truncate">{subtask.task_name}</p>
          </div>
        </div>
      </div>

      {/* Subtask Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Subtask Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-sm text-gray-600">Task Name</p>
            <p className="font-medium text-sm sm:text-base">{subtask.task_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subtask.status === "Completed" ? "bg-green-100 text-green-800" :
                subtask.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                  subtask.status === "To Do" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
              }`}>{subtask.status}</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-medium text-sm sm:text-base">{getEmployeeName(subtask.assign_to)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subtask.priority === "High" ? "bg-red-100 text-red-800" :
                subtask.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}>{subtask.priority}</span>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      {totalPrice > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Pricing Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
            <div className="bg-gray-50 p-2 sm:p-4 rounded-lg text-center border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-base sm:text-xl font-bold text-gray-800">₹{totalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-2 sm:p-4 rounded-lg text-center border border-green-100">
              <p className="text-xs text-green-600 mb-1">Earned</p>
              <p className="text-base sm:text-xl font-bold text-green-700">₹{earnedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-2 sm:p-4 rounded-lg text-center border border-yellow-100">
              <p className="text-xs text-yellow-600 mb-1">Pending</p>
              <p className="text-base sm:text-xl font-bold text-yellow-700">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-2 sm:p-4 rounded-lg text-center border border-blue-100">
              <p className="text-xs text-blue-600 mb-1">Completion</p>
              <p className="text-base sm:text-xl font-bold text-blue-700">{earningPercent}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${earningPercent}%` }}></div>
          </div>
        </div>
      )}

      {/* Time Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Time Logs</h2>
        {sortedTimeLogs.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTimeLogs.map((log, index) => (
                    <tr key={index}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">{getEmployeeName(log.user_id)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                        {log.start_time ? dayjs(log.start_time).format("DD/MM/YY HH:mm") : "N/A"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                        {log.end_time ? dayjs(log.end_time).format("DD/MM/YY HH:mm") : <span className="text-green-600 font-medium">Running</span>}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDuration(log.start_time, log.end_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : <p className="text-gray-600 text-sm">No time logs available</p>}
      </div>

      {/* Stage Completion History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Stage Completion History</h2>
        {stagesForDisplay.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {stagesForDisplay.map((stage, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="font-medium text-sm sm:text-base">{stage.name}</p>
                    <p className="text-sm text-gray-600">By: {getEmployeeName(stage.completed_by)}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-gray-600">
                      {stage.completed_at ? dayjs(stage.completed_at).format("DD/MM/YY HH:mm") : "N/A"}
                    </p>
                    {(stage.price || 0) > 0 && (
                      <div className="mt-1 flex sm:justify-end flex-wrap gap-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          +₹{(stage.price || 0).toLocaleString()} earned
                        </span>
                        <p className="text-xs text-gray-400 w-full sm:text-right">
                          Cumulative: ₹{stage.cumulativeEarned.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-600 text-sm">No stages completed yet</p>}
      </div>

      {/* Comments */}
      {subtask.comments && subtask.comments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Comments</h2>
          <div className="space-y-3 sm:space-y-4">
            {[...subtask.comments]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{comment.text}</p>
                      <p className="text-sm text-gray-600">
                        By: {comment.user_type === "employee" ? getEmployeeName(comment.user_id) : "Admin"}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                      {dayjs(comment.created_at).format("DD/MM/YY HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskLogs;