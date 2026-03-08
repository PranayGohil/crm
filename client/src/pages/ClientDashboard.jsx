import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import ProjectCard from "../components/ProjectCard.jsx";
import { statusOptions } from "../options.js";
import LoadingOverlay from "../components/LoadingOverlay.js";

const ClientDashboard = () => {
  const [status, setStatus] = useState("All Status");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const statusRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("clientUser");
    const clientUser = storedUser ? JSON.parse(storedUser) : null;
    setFullName(clientUser?.full_name);

    const fetchData = async () => {
      try {
        setLoading(true);
        const username = localStorage.getItem("clientUsername");

        const projectRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/client/projects/${username}`
        );
        const fetchedProjects = projectRes.data.projects;
        setProjects(fetchedProjects);

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

        const employeeRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        const empMap = {};
        employeeRes.data.forEach((e) => { empMap[e._id] = e; });
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

  /* click-outside closes dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredProjects = projects.filter((proj) =>
    status === "All Status" ||
    (proj.status || "").toLowerCase() === status.toLowerCase()
  );

  const summaryData = [
    { icon: "/SVG/cpd-total.svg", label: "Total Projects", value: projects.length, bg: "bg-blue-100", text: "text-blue-600" },
    { icon: "/SVG/clipboard.svg", label: "Total Subtasks", value: totalSubtasks, bg: "bg-green-100", text: "text-green-600" },
    { icon: "/SVG/cpd-complete.svg", label: "Completed", value: projects.filter((p) => p.status === "Done").length, bg: "bg-purple-100", text: "text-purple-600" },
    { icon: "/SVG/cpd-process.svg", label: "In Progress", value: projects.filter((p) => p.status === "In Progress").length, bg: "bg-yellow-100", text: "text-yellow-600" },
  ];

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Client Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {fullName || "Client"}</p>
          </div>
          {/* active-filter pill */}
          {status !== "All Status" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              {status}
              <button onClick={() => setStatus("All Status")} className="hover:text-blue-900">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {summaryData.map((item, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <img src={item.icon} alt={item.label} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + Project Cards ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Filter row */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4 sm:mb-5">
          {/* Status dropdown */}
          <div className="relative" ref={statusRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] sm:min-w-[180px] text-sm text-gray-700"
            >
              <span>{status}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <ul className="py-1 max-h-56 overflow-y-auto">
                  {["All Status", ...statusOptions].map((opt, i) => (
                    <li
                      key={i}
                      onClick={() => { setStatus(opt); setDropdownOpen(false); }}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${status === opt ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={() => setStatus("All Status")}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden xs:inline">Reset</span>
          </button>
        </div>

        {/* Result count */}
        <p className="text-xs sm:text-sm text-gray-400 mb-3">
          Showing <span className="font-semibold text-gray-600">{filteredProjects.length}</span> of {projects.length} projects
        </p>

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

export default ClientDashboard;