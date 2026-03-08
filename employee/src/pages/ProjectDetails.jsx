// Employee Panel > Project Details
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/project/get/${projectId}`
        );
        const proj = projectRes.data.project;
        setProject(proj);

        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subtask/project/${projectId}`
        );
        setSubTasks(subtasksRes.data || []);
      } catch (err) {
        console.error("Error fetching project details:", err);
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  useEffect(() => {
    const completed = subTasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    ).length;
    setCompletedCount(completed);
    setProgressPercent(
      subTasks.length ? Math.round((completed / subTasks.length) * 100) : 0
    );
  }, [subTasks]);

  const currency = project?.content?.[0]?.currency || "INR";
  const totalPrice = project?.content?.[0]?.total_price || 0;

  if (loading) return <LoadingOverlay />;
  if (!project)
    return (
      <p className="text-center py-8 text-gray-500">Project not found.</p>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-base sm:text-2xl font-semibold text-gray-800 truncate">
            Project Details
          </h1>
        </div>
      </div>

      {/* Project Name */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
          {project.project_name}
        </h2>
      </div>

      {/* Status / Priority — read-only badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Project ID:</span>
              <span className="font-medium text-gray-700 text-xs sm:text-sm break-all">
                {project._id}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                project.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {project.status || "Status Unknown"}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                project.priority === "High"
                  ? "bg-red-100 text-red-800"
                  : project.priority === "Medium"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {project.priority || "Priority Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Overview + Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
            Project Overview
          </h3>
          <div className="space-y-3 text-sm">
            {[
              {
                label: "Start Date",
                val: project.assign_date
                  ? new Date(project.assign_date).toLocaleDateString()
                  : "N/A",
              },
              {
                label: "Due Date",
                val: project.due_date
                  ? new Date(project.due_date).toLocaleDateString()
                  : "N/A",
              },
              { label: "Status", val: project.status || "N/A" },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}:</span>
                <span className="font-medium text-gray-700">{val}</span>
              </div>
            ))}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-500">Completion:</span>
                <span className="font-medium text-gray-700">
                  {completedCount}/{subTasks.length} subtasks
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
            Description
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.content?.[0]?.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Media Preview */}
      {project?.content?.[0]?.uploaded_files?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Media Preview
            </h3>
            <Link
              to={`/employee/project/gallery/${projectId}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.content[0].uploaded_files.slice(0, 3).map((url, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden border border-gray-200 aspect-video"
              >
                <img
                  src={url}
                  alt={`media-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;