// Employee Panel > Employee Profile
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const TeamMemberProfile = () => {
  const user = JSON.parse(localStorage.getItem("employeeUser"));
  const id = user._id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/get/${id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const dateFormat = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!employee) return <p className="text-center py-8 text-gray-500">Employee not found.</p>;

  const personalDetails = [
    { label: "Phone Number", value: employee.phone || "N/A", icon: "/SVG/phone-vec.svg" },
    { label: "Email Address", value: employee.email || "N/A", icon: "/SVG/mail.vec.svg" },
    { label: "Home Address", value: employee.home_address || "N/A", icon: "/SVG/home-vec.svg" },
    { label: "Date of Birth", value: dateFormat(employee.dob), icon: "/SVG/birth-vec.svg" },
    { label: "Emergency Contact", value: employee.emergency_contact || "N/A", icon: "/SVG/call-vec.svg" },
    { label: "Capacity", value: employee.capacity || "N/A", icon: "/SVG/menu-css.svg" },
  ];

  const professionalDetails = [
    { label: "Department", value: employee.department || "N/A", icon: "/SVG/dep-vec.svg" },
    { label: "Designation", value: employee.designation || "N/A", icon: "/SVG/cad-vec.svg" },
    { label: "Date of Joining", value: dateFormat(employee.date_of_joining), icon: "/SVG/doj-vec.svg" },
    { label: "Monthly Salary", value: employee.monthly_salary ? `₹${employee.monthly_salary}` : "N/A", icon: "/SVG/salary-vec.svg" },
    { label: "Employment Type", value: employee.employment_type || "N/A", icon: "/SVG/emp-typr-vec.svg" },
    { label: "Reporting Manager", value: employee.reporting_manager?.full_name || "N/A", icon: "/SVG/man-vec.svg" },
  ];

  const DetailCard = ({ title, icon: TitleIcon, items }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {TitleIcon}
          </svg>
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
              <img src={item.icon} alt={item.label} className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-800 break-words">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-base sm:text-2xl font-semibold text-gray-800">Employee Profile</h1>
          </div>

          {/* Employee panel: only Edit, no Delete */}
          <div className="flex-shrink-0">
            <Link
              to={`/employee/edit/${employee._id}`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* ── Profile Hero ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {employee.profile_pic ? (
              <img
                src={employee.profile_pic}
                alt={employee.full_name}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-blue-800 border-4 border-white shadow-md flex items-center justify-center text-white text-3xl sm:text-4xl font-bold flex-shrink-0">
                {employee.full_name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{employee.full_name || "N/A"}</h2>
                {/* Employee panel: show username inline */}
                {employee.username && (
                  <span className="text-sm text-gray-500">({employee.username})</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{employee.designation || "N/A"}</p>
              <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status === "Active" ? "bg-green-100 text-green-800"
                  : employee.status === "on-leave" ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                {employee.status === "Active" ? "Active" : employee.status === "Inactive" ? "Inactive" : "Blocked"}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col gap-2 sm:items-end">
            {employee.reporting_manager && (
              <p className="text-sm text-gray-600">
                Reported by: <span className="font-semibold">{employee.reporting_manager?.full_name || "N/A"}</span>
              </p>
            )}
            <Link
              to={`/employee/timetracking/${employee._id}`}
              className="flex items-center gap-2 border shadow-sm shadow-blue-200 py-2 px-3 rounded-lg text-sm text-blue-600 hover:text-blue-800 transition-colors w-fit"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              View Time Tracking
            </Link>
          </div>
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <DetailCard
          title="Personal Details"
          icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
          items={personalDetails}
        />
        <DetailCard
          title="Professional Details"
          icon={<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>}
          items={professionalDetails}
        />
      </div>

      {/* ── Login & Security ── */}
      {/* Employee panel: read-only view of their own credentials, no delete */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">Login & Security</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={employee.username || ""}
              readOnly
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={employee.password || ""}
              readOnly
              className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TeamMemberProfile;