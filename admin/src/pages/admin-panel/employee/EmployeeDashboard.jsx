import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

const Dropdown = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700 truncate">{selected || label}</span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 w-full min-w-[140px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1">
            {options.map((option, idx) => (
              <li key={idx}
                className="py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => { onChange(option === "All" ? "" : option); setIsOpen(false); }}>
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filters, setFilters] = useState({ department: "", role: "", status: "", search: "" });
  const [stats, setStats] = useState({ total: 0, inActive: 0, active: 0, departments: 0 });

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get-all`);
        const data = res.data;
        setEmployees(data);
        setFilteredEmployees(data);
        setDepartments([...new Set(data.map((e) => e.department))]);
        setDesignations([...new Set(data.map((e) => e.designation))]);
        setStats({
          total: data.length,
          inActive: data.filter((e) => e.status === "Inactive").length,
          active: data.filter((e) => e.status === "active" || e.status === "Active").length,
          departments: new Set(data.map((e) => e.department)).size,
        });
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = [...employees];
    if (filters.department) filtered = filtered.filter((e) => e.department?.toLowerCase() === filters.department.toLowerCase());
    if (filters.role) filtered = filtered.filter((e) => e.designation?.toLowerCase() === filters.role.toLowerCase());
    if (filters.status) filtered = filtered.filter((e) => e.status?.toLowerCase() === filters.status.toLowerCase());
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((e) => e.full_name?.toLowerCase().includes(term) || e.email?.toLowerCase().includes(term));
    }
    setFilteredEmployees(filtered);
  }, [filters, employees]);

  const statsData = [
    { label: "Total Members", value: stats.total, icon: "/SVG/icon-1.svg", cls: "bg-blue-100 text-blue-800" },
    { label: "Inactive", value: stats.inActive, icon: "/SVG/icon-2.svg", cls: "bg-red-100 text-red-800" },
    { label: "Active Now", value: stats.active, icon: "/SVG/icon-3.svg", cls: "bg-green-100 text-green-800" },
    { label: "Departments", value: stats.departments, icon: "/SVG/icon-4.svg", cls: "bg-purple-100 text-purple-800" },
  ];

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">All Employees</h1>
          </div>
          <Link to="/employee/create-profile"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        {statsData.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl shadow-sm border border-gray-200 ${item.cls}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5">{item.value}</p>
              </div>
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white flex-shrink-0">
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="Search by name, email..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Dropdown filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Dropdown label="All Departments" options={["All", ...departments]}
              selected={filters.department || "All Departments"}
              onChange={(val) => setFilters((p) => ({ ...p, department: val }))} />
            <Dropdown label="All Designations" options={["All", ...designations]}
              selected={filters.role || "All Designations"}
              onChange={(val) => setFilters((p) => ({ ...p, role: val }))} />
            <Dropdown label="All Status" options={["All", "Active", "Inactive", "Blocked"]}
              selected={filters.status || "All Status"}
              onChange={(val) => setFilters((p) => ({ ...p, status: val }))} />
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setFilters({ department: "", role: "", status: "", search: "" })}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4">
        {filteredEmployees.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-3">
                {member.profile_pic ? (
                  <img src={member.profile_pic} alt={member.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {member.full_name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{member.full_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>

              {/* Status + Manager */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${member.status === "blocked" ? "bg-red-100 text-red-800"
                    : member.status === "Inactive" ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                  {member.status === "blocked" ? "Blocked" : member.status === "Inactive" ? "Inactive" : "Active"}
                </span>
                {member.reporting_manager?.full_name && (
                  <span className="text-xs text-gray-500 truncate">
                    <Link to={`/employee/profile/${member.reporting_manager._id}`} className="text-blue-600 hover:underline">
                      {member.reporting_manager.full_name}
                    </Link>
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                {[
                  { icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", val: member.designation },
                  { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9", val: member.department },
                  { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", val: member.phone || "N/A" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={row.icon} />
                    </svg>
                    <span className="truncate">{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Monthly Salary</p>
                  <p className="text-sm font-semibold text-gray-800">{member.monthly_salary ? `₹${member.monthly_salary}` : "N/A"}</p>
                </div>
                <Link to={`/employee/profile/${member._id}`}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer count */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> team members
        </p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;