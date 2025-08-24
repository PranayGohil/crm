import React from "react";
import { Link } from "react-router-dom";

const EmployeeCard = ({ filteredEmployees, loading }) => {
  // Helper to determine the CSS class based on employee status
  const getStatusClass = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "inactive" || s === "blocked") return "status-overdue";
    if (s === "active") return "status-completed";
    return "status-default";
  };

  // Helper to format the status text
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Display a message if no employees are found
  if (filteredEmployees.length === 0 && !loading) {
    return (
      <div
        className="no-projects"
        style={{ textAlign: "center", padding: "40px" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ margin: "0 auto 16px" }}
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p>No employees found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {" "}
      {/* Using same grid class for consistency */}
      {filteredEmployees.map((member) => (
        <div className="project-card" key={member._id}>
          {" "}
          {/* Using same card class */}
          {/* Reporting Manager Chip */}
          {member.reporting_manager?.full_name && (
            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "#f0f0f0",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              <Link
                to={`/employee/profile/${member.reporting_manager._id}`}
                style={{ color: "#555", textDecoration: "none" }}
              >
                Reports to: {member.reporting_manager.full_name}
              </Link>
            </div>
          )}
          <div
            className="employee-card-header"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            {member.profile_pic ? (
              <img
                src={member.profile_pic}
                alt={member.full_name}
                className="team-avatar"
                style={{ width: "60px", height: "60px", marginRight: "15px" }}
              />
            ) : (
              <div
                className="team-avatar placeholder"
                style={{
                  width: "60px",
                  height: "60px",
                  marginRight: "15px",
                  fontSize: "24px",
                }}
              >
                {member.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h3 className="project-title" style={{ marginBottom: "4px" }}>
                {member.full_name}
              </h3>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {member.email}
              </span>
            </div>
          </div>
          <div
            className="employee-details"
            style={{
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
              padding: "15px 0",
              marginBottom: "15px",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div className="detail-item" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Designation
              </span>
              <p style={{ fontWeight: "500" }}>{member.designation || "N/A"}</p>
            </div>
            <div className="detail-item" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Department
              </span>
              <p style={{ fontWeight: "500" }}>{member.department || "N/A"}</p>
            </div>
            <div className="detail-item" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>Phone</span>
              <p style={{ fontWeight: "500" }}>{member.phone || "N/A"}</p>
            </div>
          </div>
          <div className="project-actions">
            {" "}
            {/* Reusing class from ProjectCard */}
            <div className="salary-info">
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                Monthly Salary
              </span>
              <p style={{ fontWeight: "600", fontSize: "16px" }}>
                {member.monthly_salary
                  ? `₹${member.monthly_salary.toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`status-badge ${getStatusClass(member.status)}`}>
                <span className="status-dot"></span>
                {formatStatus(member.status)}
              </span>
              <Link
                to={`/employee/profile/${member._id}`}
                className="action-btn primary-btn"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeCard;
