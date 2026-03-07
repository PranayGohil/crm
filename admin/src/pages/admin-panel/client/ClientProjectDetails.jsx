import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectCard from "../../../components/admin/ProjectCard.jsx";
import { statusOptions } from "../../../options.js";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const ClientProjectDetails = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const statuses = statusOptions;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/client/projects/${username}`);
        const fetchedProjects = projectRes.data.projects;
        setProjects(fetchedProjects);

        const subtasksMap = {};
        await Promise.all(
          fetchedProjects.map(async (project) => {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`);
            subtasksMap[project._id] = res.data;
          })
        );
        setProjectSubtasks(subtasksMap);

        const employeeRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
        const empMap = {};
        employeeRes.data.forEach((e) => { empMap[e._id] = e; });
        setEmployees(empMap);
      } catch (error) {
        console.error("Error loading project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const filteredProjects = projects.filter((project) => {
    const statusMatch = selectedStatus === "All Status" || project.status === selectedStatus;
    const searchMatch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">All Projects</h1>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 px-1 mb-4 text-sm text-gray-600">
        <span>
          <strong className="text-gray-800 text-base">{filteredProjects.length}</strong> of {projects.length} Projects
        </span>
        <span>
          <strong className="text-gray-800 text-base">{Object.keys(employees).length}</strong> Active Employees
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="All Status">All Status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Reset */}
          <button
            onClick={() => { setSelectedStatus("All Status"); setSearchTerm(""); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <ProjectCard
        filteredProjects={filteredProjects}
        projectSubtasks={projectSubtasks}
        employees={employees}
        loading={loading}
      />
    </div>
  );
};

export default ClientProjectDetails;