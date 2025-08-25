import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

const TeamMemberProfile = () => {
  const user = JSON.parse(localStorage.getItem("employeeUser"));
  const id = user._id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get/${id}`
        );
        setEmployee(res.data);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const dateFormat = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <LoadingOverlay />;
  if (!employee) return <p className="text-center py-8">Employee not found.</p>;

  const personalDetails = [
    {
      icon: "/SVG/phone-vec.svg",
      label: "Phone Number",
      value: employee.phone || "N/A",
    },
    {
      icon: "/SVG/mail.vec.svg",
      label: "Email Address",
      value: employee.email || "N/A",
    },
    {
      icon: "/SVG/home-vec.svg",
      label: "Home Address",
      value: employee.home_address || "N/A",
    },
    {
      icon: "/SVG/birth-vec.svg",
      label: "Date of Birth",
      value: dateFormat(employee.dob) || "N/A",
    },
    {
      icon: "/SVG/call-vec.svg",
      label: "Emergency Contact",
      value: employee.emergency_contact || "N/A",
    },
    {
      icon: "/SVG/menu-css.svg",
      label: "Capacity",
      value: employee.capacity || "N/A",
    },
  ];

  const professionalDetails = [
    {
      icon: "/SVG/dep-vec.svg",
      label: "Department",
      value: employee.department || "N/A",
    },
    {
      icon: "/SVG/cad-vec.svg",
      label: "Designation",
      value: employee.designation || "N/A",
    },
    {
      icon: "/SVG/doj-vec.svg",
      label: "Date of Joining",
      value: dateFormat(employee.date_of_joining) || "N/A",
    },
    {
      icon: "/SVG/salary-vec.svg",
      label: "Monthly Salary",
      value: employee.monthly_salary ? `₹${employee.monthly_salary}` : "N/A",
    },
    {
      icon: "/SVG/emp-typr-vec.svg",
      label: "Employment Type",
      value: employee.employment_type || "N/A",
    },
    {
      icon: "/SVG/man-vec.svg",
      label: "Reporting Manager",
      value: employee.reporting_manager?.full_name || "N/A",
    },
  ];

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
            <h1 className="text-2xl font-semibold text-gray-800">
              Employee Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex items-center mt-3">
              {employee.profile_pic ? (
                <img
                  src={employee.profile_pic}
                  alt={employee.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-800 border-4 border-white shadow-md flex items-center justify-center text-white text-5xl font-bold">
                  {employee.full_name?.charAt(0) || "U"}
                </div>
              )}
              <div className="ml-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold mr-2 text-gray-800">
                    {employee.full_name || "N/A"}
                  </h2>
                  {employee.username && <h5>({employee.username || "N/A"})</h5>}
                </div>
                <p className="text-gray-600">{employee.designation || "N/A"}</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    employee.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : employee.status === "on-leave"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status === "Active"
                    ? "Active"
                    : employee.status === "Inactive"
                    ? "Inactive"
                    : "Blocked"}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:items-end mt-4 md:mt-0">
              {employee.reporting_manager && (
                <p>
                  Reported By :{" "}
                  <span className="font-semibold">
                    {employee.reporting_manager?.full_name || "N/A"}
                  </span>
                </p>
              )}
              <Link
                to={`/employee/timetracking/${employee._id}`}
                className="flex items-center gap-2 mt-2 border shadow shadow-blue-600 py-2 px-3 rounded-lg text-blue-600 hover:text-blue-800"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                View Time Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Personal Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalDetails.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <img src={item.icon} alt={item.label} className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Professional Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionalDetails.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <img src={item.icon} alt={item.label} className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
