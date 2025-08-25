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
  const [assignedEmployee, setAssignedEmployee] = useState(null);

  const [mediaItems, setMediaItems] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: subtaskData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subtask/get/${subtaskId}`
      );
      setSubtask(subtaskData);

      const items = (subtaskData.media_files || []).map((file) => ({
        src: `${file}`,
        alt: file,
      }));
      setMediaItems(items);

      const { data: projectData } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/project/get/${subtaskData.project_id}`
      );
      setProject(projectData.project);

      if (subtaskData.assign_to) {
        const { data: employeeData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get/${subtaskData.assign_to}`
        );
        setAssignedEmployee(employeeData);
      }
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
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!subtask) return <p>Subtask not found!</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header - More mobile-friendly layout */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg sm:mr-4 hover:bg-gray-200 transition-colors self-start"
          >
            <svg
              width="16"
              height="16"
              className="sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h1 className="text-base sm:text-lg text-gray-800">
              Subtask Details:
            </h1>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">
              {project?.project_name || "Project Name"}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Subtask Info Card - Better mobile layout */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 break-words">
                {subtask.task_name || "Subtask Name"}
              </h2>
              <div className="text-xs sm:text-sm text-gray-600">
                <span>Project ID: {project?._id}</span>
              </div>
            </div>

            {/* Mobile-first grid layout */}
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Stage:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2 break-words">
                    {subtask.stage || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Assigned To:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2 break-words">
                    {assignedEmployee?.full_name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Start Date:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2">
                    {subtask.assign_date
                      ? formatDate(subtask.assign_date)
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    URL:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2 break-all">
                    {subtask.url ? (
                      <a
                        href={subtask.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {subtask.url.length > 30
                          ? `${subtask.url.substring(0, 30)}...`
                          : subtask.url}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Status:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2">
                    {subtask.status || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100 sm:border-b-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Due Date:
                  </span>
                  <span className="text-sm font-semibold text-right ml-2">
                    {subtask.due_date ? formatDate(subtask.due_date) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                {subtask.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Media Section - Improved mobile grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Attached Media
              </h2>
            </div>

            {mediaItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm sm:text-base">No media attached.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                      <div className="flex space-x-2">
                        <a
                          href={item.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-full hover:bg-gray-100 touch-manipulation"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Better mobile positioning */}
        <div className="space-y-4 sm:space-y-6 order-first lg:order-last">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Project Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Project Name
                </p>
                <p className="text-sm sm:text-base font-medium break-words">
                  {project?.project_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Project ID
                </p>
                <p className="text-sm sm:text-base font-medium break-all">
                  {project?._id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubtask;
