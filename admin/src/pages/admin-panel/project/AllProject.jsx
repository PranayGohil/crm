import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { statusOptions } from "../../../options.js";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";
import ProjectCard from "../../../components/admin/ProjectCard";

const AllProject = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState({ id: "All Client", name: "All Client" });
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectSubtasks, setProjectSubtasks] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState("All Stages");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/client/get-all`)
      .then((r) => setClients(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/project/get-all`);
        setProjects(res.data);

        const subtaskResults = await Promise.all(
          res.data.map(async (p) => {
            const r = await axios.get(`${process.env.REACT_APP_API_URL}/api/subtask/project/${p._id}`);
            return { projectId: p._id, subtasks: r.data };
          })
        );

        const subtasksMap = {};
        const allEmployeeIds = new Set();
        subtaskResults.forEach(({ projectId, subtasks }) => {
          subtasksMap[projectId] = subtasks;
          subtasks.forEach((t) => { if (t.assign_to) allEmployeeIds.add(t.assign_to); });
        });
        setProjectSubtasks(subtasksMap);

        if (allEmployeeIds.size > 0) {
          const empRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-multiple`, {
            params: { ids: Array.from(allEmployeeIds).join(",") },
          });
          const empMap = {};
          empRes.data.forEach((e) => { empMap[e._id] = e; });
          setEmployees(empMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const clientMatch = selectedClient.id === "All Client" || p.client_id === selectedClient._id;
    const statusMatch = selectedStatus === "All Status" || p.status.toLowerCase() === selectedStatus.toLowerCase();
    const searchMatch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const stageMatch = selectedStage === "All Stages" || (p.stages || []).includes(selectedStage);
    return clientMatch && statusMatch && searchMatch && stageMatch;
  });

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate("/")}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">All Projects</h1>
          </div>
          <Link to="/project/add"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
            <span className="hidden sm:inline">Add Project</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{filteredProjects.length}</p>
          <p className="text-sm text-gray-500">of {projects.length} Projects</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{Object.keys(employees).length}</p>
          <p className="text-sm text-gray-500">Active Employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <select value={selectedClient.id}
              onChange={(e) => {
                const client = clients.find((c) => c._id === e.target.value) || { id: "All Client", name: "All Client" };
                setSelectedClient(client);
              }}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="All Client">All Clients</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.full_name}</option>)}
            </select>
            <select value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="All Status">All Status</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="All Stages">All Stages</option>
              {["CAD Design", "SET Design", "Render"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => { setSelectedClient({ id: "All Client", name: "All Client" }); setSelectedStatus("All Status"); setSelectedStage("All Stages"); setSearchTerm(""); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <ProjectCard
        filteredProjects={filteredProjects}
        projectSubtasks={projectSubtasks}
        loading={loading}
        employees={employees}
      />
    </div>
  );
};

export default AllProject;