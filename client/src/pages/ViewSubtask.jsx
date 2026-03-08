// Client Panel > View Subtask Details
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { toast } from "react-toastify";

const ViewSubtask = () => {
  const { subtaskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [subtask, setSubtask] = useState(null);
  const [project, setProject] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);

  // Mobile: sidebar toggle (matches admin pattern)
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subtaskData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
      );
      setSubtask(subtaskData);
      setMediaItems(
        (subtaskData.media_files || []).map((file) => ({ src: file, alt: file }))
      );

      const { data: projectData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`
      );
      setProject(projectData.project);
    } catch (error) {
      console.error("Failed to load subtask details:", error);
      toast.error("Failed to load subtask details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subtaskId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <p className="text-center py-8 text-gray-500">Subtask not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Subtask Details</p>
              <h1 className="text-base sm:text-xl font-semibold text-gray-800 truncate">
                {project?.project_name || "Project Name"}
              </h1>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Info
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Subtask Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {subtask.task_name || "Subtask Name"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                  <span className="truncate">Project ID: {project?._id}</span>
                </div>
              </div>

              {/* Read-only status + priority badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.status === "Completed" ? "bg-green-100 text-green-800"
                    : subtask.status === "In Progress" ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {subtask.status || "Unknown"}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${subtask.priority === "High" ? "bg-red-100 text-red-800"
                    : subtask.priority === "Medium" ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                  {subtask.priority || "Unknown"}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="space-y-3">
                {/* Stages */}
                <div>
                  <span className="text-xs sm:text-sm text-gray-600 block mb-1">Stages:</span>
                  {Array.isArray(subtask.stages) && subtask.stages.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {subtask.stages.map((stg, i) => {
                        const name = typeof stg === "string" ? stg : stg.name;
                        const completed = stg?.completed;
                        return (
                          <span key={i} className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${completed
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}>
                              {completed && <span className="mr-0.5">✓</span>}
                              {name}
                            </span>
                            {i < subtask.stages.length - 1 && (
                              <span className="text-gray-400 text-xs">→</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No stages</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Date:</span>
                  <span className="font-medium text-sm">{formatDate(subtask.assign_date)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="font-medium text-sm">{subtask.status || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium text-sm">{formatDate(subtask.due_date)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
                {subtask.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Media Section — view only, no upload/remove */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Attached Media</h2>
            </div>

            {mediaItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No media attached.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-28 sm:h-40 object-cover rounded-lg border border-gray-200"
                      loading="lazy"
                    />
                    {/* View-only hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                      <a
                        href={item.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── always visible on lg, toggleable on mobile */}
        <div className={`space-y-4 sm:space-y-6 ${showSidebar ? "block" : "hidden lg:block"}`}>

          {/* Mobile close button */}
          <div className="flex justify-end lg:hidden">
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 text-sm flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Project Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Project Name</p>
                <p className="font-medium text-sm sm:text-base">{project?.project_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Project ID</p>
                <p className="font-medium text-xs break-all">{project?._id || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Stage Breakdown — read-only, no prices shown to client */}
          {Array.isArray(subtask.stages) && subtask.stages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Stage Progress
              </h3>
              <div className="space-y-1.5">
                {subtask.stages.map((stage, i) => {
                  const name = typeof stage === "string" ? stage : stage.name;
                  const completed = stage?.completed || false;
                  return (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${completed
                        ? "bg-green-50 border border-green-100"
                        : "bg-gray-50 border border-gray-100"
                      }`}>
                      {completed ? (
                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-xs truncate ${completed ? "text-green-800 font-medium" : "text-gray-600"
                        }`}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSubtask;