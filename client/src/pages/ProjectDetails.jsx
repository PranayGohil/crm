import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { statusOptions, priorityOptions } from "../options";
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {project.project_name}
          </h2>
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

        {/* Project Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Project Content
            </h3>
            <p className="text-gray-600">
              Manage all project content, items, and pricing details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Jewelry Items & Pricing
              </h4>
              {project?.content?.[0]?.items?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jewelry Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price per Item ({currency})
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total ({currency})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.content[0].items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.price}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity * item.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-4 text-sm font-medium text-gray-900"
                        >
                          Sub Total
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {project.content[0].items.reduce(
                            (sum, i) => sum + i.quantity * i.price,
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No items added yet.</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Pricing Overview
              </h4>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-2">Total Project Price</p>
                <p className="text-2xl font-bold text-blue-800">
                  {currency} {totalPrice}
                </p>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">
                Content Included
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-1">Media</h5>
                <p className="text-gray-600 mb-2">Uploaded Media</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {project?.content?.[0]?.uploaded_files?.length || 0} files
                  </span>
                  <Link
                    to={`/project/gallery/${projectId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {project?.content?.[0]?.uploaded_files?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Media Preview
              </h3>
              <Link
                to={`/project/gallery/${projectId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.content[0].uploaded_files.slice(0, 3).map((url, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`media${idx}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetails;
