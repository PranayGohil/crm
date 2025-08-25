import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";
import { Modal, Button } from "react-bootstrap";

const ClientDetailsPage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch client + subtasks
  useEffect(() => {
    const storedUser = localStorage.getItem("clientUser");
    const clientUser = storedUser ? JSON.parse(storedUser) : null;
    console.log("Client ID:", clientUser?._id);
    const fetchClient = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/get/${clientUser?._id}`
        );
        // also fetch subtasks for this client
        const subtasksRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/tasks/${res.data._id}`
        );
        const clientData = res.data;
        clientData.subtasks = subtasksRes.data || [];
        setClient(clientData);
      } catch (error) {
        console.error("Failed to fetch client:", error);
        toast.error("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

  if (loading) return <LoadingOverlay />;

  if (!client)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Client not found</p>
      </div>
    );

  // count subtasks by status
  const subtasks = client.subtasks || [];
  const totalTasks = subtasks.length;

  const completed = subtasks.filter((t) => t.status === "Completed").length;
  const todo = subtasks.filter((t) => t.status === "To Do").length;
  const inProgress = subtasks.filter((t) => t.status === "In Progress").length;
  const paused = subtasks.filter((t) => t.status === "Paused").length;
  const blocked = subtasks.filter((t) => t.status === "Blocked").length;

  const donePercent =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {client.full_name}
              </h1>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Active</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  Client ID: #{client._id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contact & Identity Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Contact & Identity Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Username
                </label>
                <p className="font-medium">{client.username}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email Address
                </label>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                <p className="font-medium">{client.phone}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Joining Date
                </label>
                <p className="font-medium">
                  {new Date(client.joining_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Address
              </label>
              <p className="font-medium">{client.address}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Preferred Contact Method
                </label>
                <p className="font-medium">Email</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Client Type
                </label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {client.client_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Company Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Company Name
              </label>
              <p className="font-medium">{client.company_name || "---"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                GST / VAT Number
              </label>
              <p className="font-medium">{client.gst_number || "---"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Website
              </label>
              {client.website ? (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {client.website}
                </a>
              ) : (
                <p className="font-medium">---</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                LinkedIn
              </label>
              {client.linkedin ? (
                <a
                  href={client.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {client.linkedin}
                </a>
              ) : (
                <p className="font-medium">---</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Additional Notes
              </label>
              <p className="font-medium">{client.additional_notes || "---"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          Task Summary
        </h2>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600">
              Total Tasks:{" "}
              <span className="font-medium text-gray-800">{totalTasks}</span> /{" "}
              <span className="font-medium text-gray-800">{completed}</span>{" "}
              Completed
            </p>
            <span className="font-medium text-gray-800">{donePercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${donePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Total Tasks Assigned</p>
            <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 mb-1">Tasks To Do</p>
            <p className="text-2xl font-bold text-blue-800">{todo}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-sm text-yellow-600 mb-1">Tasks In Progress</p>
            <p className="text-2xl font-bold text-yellow-800">{inProgress}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-600 mb-1">Tasks Paused</p>
            <p className="text-2xl font-bold text-purple-800">{paused}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-red-600 mb-1">Tasks Blocked</p>
            <p className="text-2xl font-bold text-red-800">{blocked}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-green-800">{completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPage;
