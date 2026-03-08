// Client Panel > Project Details
import React, { useEffect, useState } from "react";
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
    return <p className="text-center py-8 text-gray-500">Project not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* ── Page Header ── */}
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

      {/* ── Project Name ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
          {project.project_name}
        </h2>
      </div>

      {/* ── Status / Priority — read-only ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-4">
          {/* Left: meta info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Project ID:</span>
              <span className="font-medium text-gray-700 text-xs sm:text-sm break-all">
                {project._id}
              </span>
            </div>
          </div>

          {/* Right: badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              project.status === "Completed"   ? "bg-green-100 text-green-800"
              : project.status === "In Progress" ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
            }`}>
              {project.status || "Unknown"}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              project.priority === "High"   ? "bg-red-100 text-red-800"
              : project.priority === "Medium" ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
            }`}>
              {project.priority || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Overview + Description ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Overview */}
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

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
            Description
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.content?.[0]?.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* ── Project Content ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Project Content
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          Project content, items, and pricing details
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items table */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Jewelry Items &amp; Pricing
            </h4>
            {project?.content?.[0]?.items?.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Item",
                        "Qty",
                        `Price (${currency})`,
                        `Total (${currency})`,
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {project.content[0].items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-3 text-gray-800">{item.name}</td>
                        <td className="px-3 py-3 text-gray-700">{item.quantity}</td>
                        <td className="px-3 py-3 text-gray-700">{item.price}</td>
                        <td className="px-3 py-3 text-gray-700 font-medium">
                          {item.quantity * item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-2.5 text-sm font-semibold text-gray-700"
                      >
                        Sub Total
                      </td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-gray-700">
                        {project.content[0].items.reduce(
                          (s, i) => s + i.quantity * i.price,
                          0
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items added yet.</p>
            )}
          </div>

          {/* Pricing + media summary */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Pricing Overview
            </h4>
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <p className="text-xs text-gray-500 mb-1">Total Project Price</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">
                {currency} {totalPrice}
              </p>
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mb-2">Media</h4>
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Uploaded files</p>
                <p className="text-sm font-medium text-gray-700">
                  {project?.content?.[0]?.uploaded_files?.length || 0} files
                </p>
              </div>
              <Link
                to={`/project/gallery/${projectId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Media Preview ── */}
      {project?.content?.[0]?.uploaded_files?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              Media Preview
            </h3>
            <Link
              to={`/project/gallery/${projectId}`}
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