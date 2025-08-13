import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    <div className={`btn_main ${isOpen ? "open" : ""}`} ref={ref}>
      <div
        className="dropdown_toggle header-dropdown-width"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text_btn">{selected || label}</span>
        <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
      </div>
      {isOpen && (
        <ul className="dropdown_menu">
          {options.map((option, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(option === "All" ? "" : option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

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

  const [designations, setDesignations] = useState([]);

  const dropdownData = {
    departments: ["HR", "Development", "Design", "Sales"], // customize to match your real departments
    designations: designations.map((d) => d.name),
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

        const total = data.length;
        const inActive = data.filter((e) => e.status === "Inactive").length;
        const active = data.filter(
          (e) => e.status === "active" || e.status === "Active"
        ).length;
        const departments = new Set(data.map((e) => e.department)).size;
        setStats({ total, inActive, active, departments });
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchDesignations = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/designation/get-all`
        );
        setDesignations(res.data.designations);
      } catch (err) {
        console.error("Failed to fetch designations:", err);
      }
    };
    fetchEmployees();
    fetchDesignations();
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
      className: "inf-sec-1",
    },
    {
      label: "Inactive",
      value: stats.inActive,
      icon: "/SVG/icon-2.svg",
      className: "inf-sec-2",
    },
    {
      label: "Active Now",
      value: stats.active,
      icon: "/SVG/icon-3.svg",
      className: "inf-sec-3",
    },
    {
      label: "Department",
      value: stats.departments,
      icon: "/SVG/icon-4.svg",
      className: "inf-sec-4",
    },
  ];

  if (loading) return <LoadingOverlay />;

  return (
    <section className="team_member_dashboard">
      {/* Header */}
      <section className="header">
        <div className="head-menu">
          <div className="anp-header-inner">
            <div className="anp-heading-main">
              <div
                className="anp-back-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src="/SVG/arrow-pc.svg"
                  alt="back"
                  className="mx-2"
                  style={{ scale: "1.3" }}
                />
              </div>
              <div className="head-menu">
                <h1 style={{ marginBottom: "0", fontSize: "1.5rem" }}>
                  All Employees{" "}
                </h1>
              </div>
            </div>
          </div>
          <div className="nav-search">
            <div className="searchbar">
              <div className="input-type">
                <img src="/SVG/search-icon.svg" alt="search" className="mx-2" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="cd-input-type-txt input-type-txt p-2"
                  style={{ border: "none" }}
                />
              </div>
            </div>
            <div className="add-mbr">
              <a href="/employee/create-profile" className="plus-icon">
                <img src="/SVG/plus.svg" alt="add" /> <span>Add Member</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="tm-menubar">
          <div className="menu-bar">
            <Dropdown
              label="All Departments"
              options={dropdownData.departments}
              selected={filters.department || "All Departments"}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, department: val }))
              }
            />
            <Dropdown
              label="All Designation"
              options={dropdownData.designations}
              selected={filters.role || "All Designations"}
              onChange={(val) => setFilters((prev) => ({ ...prev, role: val }))}
            />
            <Dropdown
              label="All Status"
              options={dropdownData.statuses}
              selected={filters.status || "All Status"}
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val }))
              }
            />
          </div>
          <div className="tm-filter filter">
            <div
              onClick={(e) => {
                e.preventDefault();
                setFilters({
                  department: "",
                  role: "",
                  status: "",
                  search: "",
                });
              }}
            >
              <img src="/SVG/filter-vector.svg" alt="reset" className="mx-2" />{" "}
              <span>Reset Filters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="main-1">
        <div className="member-inf">
          {statsData.map((item, idx) => (
            <div className={`${item.className} inf-sec`} key={idx}>
              <div className="name1">
                <p>{item.label}</p>
                <span>{item.value}</span>
              </div>
              <div className="inf-icon">
                <img src={item.icon} alt={item.label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member cards */}
      <section className="main-2">
        {filteredEmployees.map((member) => (
          <div className="person-data" key={member._id}>
            <div className="background-color"></div>
            <div className="person-1-data">
              <div className="prn-img">
                {member.profile_pic ? (
                  <img
                    src={member.profile_pic}
                    alt={member.full_name}
                    className="profile-pic"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="profile-pic"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundColor: "#0a3749",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      marginTop: "-50px",
                      border: "5px solid #fff",
                    }}
                  >
                    {member.full_name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="prn1-inf">
                <div className="prn1-name">
                  <p>{member.full_name}</p>
                  <span>{member.email}</span>
                </div>
                <div>
                  <div
                    className={`${
                      member.status === "blocked"
                        ? "badge text-bg-danger"
                        : member.status === "Inactive"
                        ? "badge text-bg-danger"
                        : "badge text-bg-success"
                    } prn-activity p-2`}
                  >
                    {member.status === "blocked"
                      ? "Blocked"
                      : member.status === "Inactive"
                      ? "Inactive"
                      : "Active"}
                  </div>
                </div>
              </div>
            </div>
            <div className="person-education-inf">
              <div className="edu inf-1">
                <img src="/SVG/prn-data-v1.svg" alt="designation" />
                <p>{member.designation}</p>
              </div>
              <div className="edu inf-2">
                <img src="/SVG/prn-data-v2.svg" alt="department" />
                <p>{member.department}</p>
              </div>
              <div className="edu inf-3">
                <img src="/SVG/prn-data-v3.svg" alt="phone" />
                <p>{member.phone}</p>
              </div>
            </div>
            <div className="hours-profile">
              <div className="logged-hours">
                <p>Monthly Salary</p>
                <span>
                  {member.monthly_salary ? `₹${member.monthly_salary}` : "N/A"}
                </span>
              </div>
              <a
                href={`/employee/profile/${member._id}`}
                className="view-profile"
              >
                View Profile
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <section className="main-3">
        <div className="showing-men">
          <span>
            Showing {filteredEmployees.length} of {employees.length} team
            members
          </span>
        </div>
      </section>
    </section>
  );
};

export default EmployeeDashboard;
