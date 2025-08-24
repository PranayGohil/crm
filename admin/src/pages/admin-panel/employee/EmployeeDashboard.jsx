import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/admin/LoadingOverlay";

// Reusable Dropdown Component
const Dropdown = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-gray-700">{selected || label}</span>
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
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1">
            {options.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onChange(option === "All" ? "" : option);
                  setIsOpen(false);
                }}
              >
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

  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
    search: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    inActive: 0,
    active: 0,
    departments: 0,
  });

  const dropdownData = {
    departments: departments,
    designations: designations,
    statuses: ["Active", "Inactive", "Blocked"],
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get-all`
        );
        const data = res.data;
        setEmployees(data);
        setFilteredEmployees(data);

        const departments = new Set(data.map((e) => e.department));
        const designations = new Set(data.map((e) => e.designation));

        setDepartments([...departments]);
        setDesignations([...designations]);

        const totalEmployees = data.length;
        const totalInActive = data.filter(
          (e) => e.status === "Inactive"
        ).length;
        const totalActive = data.filter(
          (e) => e.status === "active" || e.status === "Active"
        ).length;
        const departmentSize = new Set(data.map((e) => e.department)).size;
        setStats({
          total: totalEmployees,
          inActive: totalInActive,
          active: totalActive,
          departments: departmentSize,
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

  // Apply filters when filters change
  useEffect(() => {
    let filtered = [...employees];
    if (filters.department) {
      filtered = filtered.filter(
        (e) => e.department?.toLowerCase() === filters.department.toLowerCase()
      );
    }
    if (filters.role) {
      filtered = filtered.filter(
        (e) => e.designation?.toLowerCase() === filters.role.toLowerCase()
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (e) => e.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.full_name?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term)
      );
    }
    setFilteredEmployees(filtered);
  }, [filters, employees]);

  const statsData = [
    {
      label: "Total Members",
      value: stats.total,
      icon: "/SVG/icon-1.svg",
      className: "bg-blue-100 text-blue-800",
    },
    {
      label: "Inactive",
      value: stats.inActive,
      icon: "/SVG/icon-2.svg",
      className: "bg-red-100 text-red-800",
    },
    {
      label: "Active Now",
      value: stats.active,
      icon: "/SVG/icon-3.svg",
      className: "bg-green-100 text-green-800",
    },
    {
      label: "Department",
      value: stats.departments,
      icon: "/SVG/icon-4.svg",
      className: "bg-purple-100 text-purple-800",
    },
  ];

  if (loading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-center" />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
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
              All Employees
            </h1>
          </div>
          <Link
            to="/employee/create-profile"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
            <span className="ml-2">Add Member</span>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-lg shadow-sm border border-gray-200 ${item.className}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Dropdown
              label="All Departments"
              options={["All", ...dropdownData.departments]}
              selected={filters.department || "All Departments"}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, department: val }))
              }
            />
            <Dropdown
              label="All Designation"
              options={["All", ...dropdownData.designations]}
              selected={filters.role || "All Designations"}
              onChange={(val) => setFilters((prev) => ({ ...prev, role: val }))}
            />
            <Dropdown
              label="All Status"
              options={["All", ...dropdownData.statuses]}
              selected={filters.status || "All Status"}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val }))
              }
            />
            <button
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() =>
                setFilters({
                  department: "",
                  role: "",
                  status: "",
                  search: "",
                })
              }
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
      </div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {filteredEmployees.map((member) => (
          <div
            key={member._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 flex flex-col justify-between h-100">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {member.profile_pic ? (
                      <img
                        src={member.profile_pic}
                        alt={member.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {member.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {member.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex justify-between">
                  <div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        member.status === "blocked"
                          ? "bg-red-100 text-red-800"
                          : member.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {member.status === "blocked"
                        ? "Blocked"
                        : member.status === "Inactive"
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </div>
                  {member.reporting_manager?.full_name && (
                    <div className="mb-4 text-sm text-gray-600">
                      <span className="font-medium">Reported By: </span>
                      <Link
                        to={`/employee/profile/${member.reporting_manager._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {member.reporting_manager.full_name}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{member.designation}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9"
                      />
                    </svg>
                    <span>{member.department}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{member.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm my-1 text-gray-600">
                      Monthly Salary
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {member.monthly_salary
                        ? `₹${member.monthly_salary}`
                        : "N/A"}
                    </div>
                  </div>
                  <Link
                    to={`/employee/profile/${member._id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} team members
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
