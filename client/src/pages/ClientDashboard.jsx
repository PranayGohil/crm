import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProjectCard from "../components/ProjectCard.jsx";
import { statusOptions, stageOptions } from "../options.js";
import LoadingOverlay from "../components/LoadingOverlay.js";

const ClientDashboard = () => {
  const [status, setStatus] = useState("All Status");
  const [dropdownOpen, setDropdownOpen] = useState({
    status: false,
  });

  const statusRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  // 📦 Fetch data
  useEffect(() => {
    const storedUser = localStorage.getItem("clientUser");
    const clientUser = storedUser ? JSON.parse(storedUser) : null;
    setFullName(clientUser?.full_name);
    const token = clientUser?.token;
    const fetchData = async () => {
      try {
        setLoading(true);
        const username = localStorage.getItem("clientUsername");

        // 1️⃣ Projects
        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/projects/${username}`
        );
        const fetchedProjects = projectRes.data.projects;
        setProjects(fetchedProjects);

        // 2️⃣ Subtasks
        const subtasksMap = {};
        await Promise.all(
          fetchedProjects.map(async (project) => {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/subtask/project/${project._id}`
            );
            subtasksMap[project._id] = res.data;
          })
        );
        setProjectSubtasks(subtasksMap);

        // 3️⃣ Employees
        const employeeRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        const empMap = {};
        employeeRes.data.forEach((e) => {
          empMap[e._id] = e;
        });
        setEmployees(empMap);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSubtasks = Object.values(projectSubtasks).reduce(
    (acc, subtasks) => acc + (subtasks?.length || 0),
    0
  );

  // 🪄 Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setDropdownOpen((prev) => ({ ...prev, status: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (type) => {
    setDropdownOpen((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // 🧩 Filter projects
  const filteredProjects = projects.filter((proj) => {
    const matchStatus =
      status === "All Status" ||
      (proj.status || "").toLowerCase() === status.toLowerCase();
    
    return matchStatus;
  });

  // Summary cards
  const summaryData = [
    {
      icon: "/SVG/cpd-total.svg",
      label: "Total Projects",
      value: projects.length,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      icon: "/SVG/clipboard.svg",
      label: "Total Subtasks",
      value: totalSubtasks,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      icon: "/SVG/cpd-complete.svg",
      label: "Completed",
      value: projects.filter((p) => p.status === "Done").length,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      icon: "/SVG/cpd-process.svg",
      label: "In Progress",
      value: projects.filter((p) => p.status === "In Progress").length,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  ];

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-center" />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Client Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {fullName || "Client"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-end gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <button
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => toggleDropdown("status")}
              >
                <span className="text-sm text-gray-700">{status}</span>
                <svg
                  className="w-4 h-4 ml-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen.status && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <ul className="py-1 px-0">
                    <li
                      className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setStatus("All Status");
                        setDropdownOpen((prev) => ({ ...prev, status: false }));
                      }}
                    >
                      All Status
                    </li>
                    {statusOptions.map((option, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setStatus(option);
                          setDropdownOpen((prev) => ({
                            ...prev,
                            status: false,
                          }));
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => {
                setStatus("All Status");
              }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>
        {/* Project cards */}
        <div className="pt-2">
          <ProjectCard
            filteredProjects={filteredProjects}
            projectSubtasks={projectSubtasks}
            employees={employees}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
