import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Designation = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`);
      setDesignations(res.data.designations);
    } catch (err) {
      console.error("Failed to fetch designations", err);
      setError("Failed to load designations.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDesignation.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/designation/add`,
        { name: newDesignation.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDesignations((prev) => [...prev, res.data]);
      setNewDesignation("");
    } catch (err) {
      console.error("Failed to add designation", err);
      setError("Failed to add designation.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/designation/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDesignations((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Failed to delete designation", err);
      setError("Failed to delete designation.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Manage Designations</h1>
            {!loading && (
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{designations.length} designation{designations.length !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Add Input */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Designation</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Senior Developer"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newDesignation.trim()}
              className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              <span className="hidden xs:inline">{adding ? "Adding…" : "Add"}</span>
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {/* List */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
              <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Loading designations…</span>
            </div>
          ) : designations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
              </svg>
              <p className="text-gray-400 text-sm font-medium">No designations yet</p>
              <p className="text-gray-300 text-xs mt-1">Add your first designation above</p>
            </div>
          ) : (
            <ul className="space-y-2 pl-0">
              {designations.map((desig, idx) => (
                <li
                  key={desig._id}
                  className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-gray-800 truncate">{desig.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(desig._id)}
                    disabled={deletingId === desig._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {deletingId === desig._id ? (
                      <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="hidden xs:inline">{deletingId === desig._id ? "Deleting…" : "Delete"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Designation;