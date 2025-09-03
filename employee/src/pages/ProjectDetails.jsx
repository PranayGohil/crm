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
  
  if (loading) return <LoadingOverlay />;
  if (!project) return <p>Project not found!</p>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
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
              <h1 className="text-2xl font-semibold text-gray-800">
                Project Details
              </h1>
            </div>
          </div>
        </div>

        {/* Project Title */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {project.project_name}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2"> 
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
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
           <div className="flex flex-col gap-2"> 
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {project.status || "Status Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Project Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">
                  {project.assign_date
                    ? new Date(project.assign_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{project.status || "N/A"}</span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">
                    {completedCount}/{subTasks.length} subtasks
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Description
            </h3>
            <p className="text-gray-700">
              {project.content?.[0]?.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
