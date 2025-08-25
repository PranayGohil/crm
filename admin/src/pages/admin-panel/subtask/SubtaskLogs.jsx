import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

// Extend dayjs with duration
dayjs.extend(duration);

const SubtaskLogs = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subtask, setSubtask] = useState(null);
  const [employees, setEmployees] = useState({});

  const fetchSubtaskData = async () => {
      try {
        setLoading(true);

        // Fetch subtask details
        const subtaskRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
        );
        setSubtask(subtaskRes.data);

        // Fetch all employees to map user IDs to names
        const employeesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );

        const empMap = {};
        employeesRes.data.forEach((emp) => {
          empMap[emp._id] = emp;
        });

        setEmployees(empMap);
      } catch (error) {
        console.error("Error fetching subtask data:", error);
        toast.error("Failed to load subtask logs");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSubtaskData();
  }, [subtaskId]);

  // Function to get employee name by ID
  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Unknown";
    const employee = employees[employeeId];
    return employee ? employee.full_name : "Unknown";
  };

  // Function to format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";

    const start = dayjs(startTime);
    const end = endTime ? dayjs(endTime) : dayjs();
    const diff = end.diff(start);
    const dur = dayjs.duration(diff);

    const hours = dur.hours();
    const minutes = dur.minutes();

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Sort time logs by start time (newest first)
  const sortedTimeLogs = subtask?.time_logs
    ? [...subtask.time_logs].sort((a, b) => {
        const dateA = a.start_time ? new Date(a.start_time) : new Date(0);
        const dateB = b.start_time ? new Date(b.start_time) : new Date(0);
        return dateB - dateA;
      })
    : [];

  // Sort completed stages by completion date (newest first)
  const sortedCompletedStages = subtask?.stages
    ? subtask.stages
        .filter((stage) => stage.completed)
        .sort((a, b) => {
          const dateA = a.completed_at ? new Date(a.completed_at) : new Date(0);
          const dateB = b.completed_at ? new Date(b.completed_at) : new Date(0);
          return dateB - dateA;
        })
    : [];

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <div>Subtask not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Subtask Logs
            </h1>
            <p className="text-gray-600">{subtask.task_name}</p>
          </div>
        </div>
      </div>

      {/* Subtask Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Subtask Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Task Name</p>
            <p className="font-medium">{subtask.task_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subtask.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : subtask.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : subtask.status === "To Do"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {subtask.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assigned To</p>
            <p className="font-medium">{getEmployeeName(subtask.assign_to)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subtask.priority === "High"
                  ? "bg-red-100 text-red-800"
                  : subtask.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {subtask.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Time Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Time Logs</h2>
        {sortedTimeLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTimeLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEmployeeName(log.user_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.start_time
                        ? dayjs(log.start_time).format("DD/MM/YYYY HH:mm")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.end_time
                        ? dayjs(log.end_time).format("DD/MM/YYYY HH:mm")
                        : "Still running"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(log.start_time, log.end_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No time logs available</p>
        )}
      </div>

      {/* Stage Completion Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Stage Completion History
        </h2>
        {sortedCompletedStages.length > 0 ? (
          <div className="space-y-4">
            {sortedCompletedStages.map((stage, index) => (
              <div
                key={index}
                className="border-l-4 border-green-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{stage.name}</p>
                    <p className="text-sm text-gray-600">
                      Completed by: {getEmployeeName(stage.completed_by)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {stage.completed_at
                        ? dayjs(stage.completed_at).format("DD/MM/YYYY HH:mm")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No stages completed yet</p>
        )}
      </div>

      {/* Comments - If you have comments in your data */}
      {subtask.comments && subtask.comments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
          <div className="space-y-4">
            {[...subtask.comments]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((comment, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{comment.text}</p>
                      <p className="text-sm text-gray-600">
                        By:{" "}
                        {comment.user_type === "employee"
                          ? getEmployeeName(comment.user_id)
                          : "Admin"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {dayjs(comment.created_at).format("DD/MM/YYYY HH:mm")}
                      </p>
                    </div>
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
