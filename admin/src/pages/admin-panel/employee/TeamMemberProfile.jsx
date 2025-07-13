import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const TeamMemberProfile = () => {
  const { id } = useParams(); // get employee id from route
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
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

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!employee)
    return <p style={{ textAlign: "center" }}>Employee not found.</p>;

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
      value: employee.address || "N/A",
    },
    {
      icon: "/SVG/birth-vec.svg",
      label: "Date of Birth",
      value: employee.dob || "N/A",
    },
    {
      icon: "/SVG/call-vec.svg",
      label: "Emergency Contact",
      value: employee.emergency_contact || "N/A",
    },
  ];

  const professionalDetails = [
    {
      icon: "/SVG/emp-id.svg",
      label: "Employee ID",
      value: employee.employee_id || "N/A",
    },
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
      value: employee.date_of_joining || "N/A",
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
      value: employee.reporting_manager || "N/A",
    },
  ];

  return (
    <>
      <section className="page2-main1">
        <div className="member-profile">
          <div className="mem-pro-vec">
            <img src="/SVG/vec-mem-pro.svg" alt="vec" />
            <span>Team Member Profile</span>
          </div>
          <div className="edit-profile">
            <Link to={`/employee/edit/${employee._id}`}>
              <img src="/SVG/edit-white.svg" alt="edit" />
              Edit
            </Link>
          </div>
        </div>
      </section>

      <section className="page2-main2 tmp-main-inner">
        <div className="member-detail">
          <div className="sec1-color"></div>
          <div className="member1-data">
            <div className="mem-img" style={{ height: "100px" }}>
              {employee.profile_pic ? (
                <img
                  src={employee.profile_pic}
                  alt={employee.full_name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff", // choose any color you like
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    marginTop: "-64px",
                    position: "absolute",
                    border: "5px solid white",
                  }}
                >
                  {employee.full_name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <div className="mem-detail-txt">
              <div className="mem-inf">
                <div className="mem1-name">
                  <p>{employee.full_name || "N/A"}</p>
                  <span>{employee.designation || "N/A"}</span>
                </div>
                <div
                  className={`${
                    employee.status === "Active"
                      ? "badge text-bg-success p-2"
                      : employee.status === "on-leave"
                      ? "badge text-bg-warning p-2"
                      : "badge text-bg-danger p-2"
                  }`}
                >
                  

                  {employee.status === "Active"
                    ? "Active"
                    : employee.status === "on-leave"
                    ? "On Leave"
                    : "Blocked"}
                </div>
              </div>
              <div className="time-tracker">
                <img src="/SVG/time.svg" alt="time" />
                {/* <Link to={`/employee/timetracking/${employee._id}`}>
                  View Time Tracking
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tmp-page2 tmp-main-inner">
        <div className="page2-main3">
          <div className="emp-detail-header mem-personal-detail">
            <div className="main-heading personal-detail">
              <img src="/SVG/prn-vec.svg" alt="prn" />
              <span>Personal Details</span>
            </div>
            {personalDetails.map((item, index) => (
              <div className="emp-detail-inner" key={index}>
                <img src={item.icon} alt={item.label} />
                <div className="emp-detail">
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="emp-detail-header mem-professional-detail">
            <div className="main-heading personal-detail">
              <img src="/SVG/pro-vc.svg" alt="prn" />
              <span>Professional Details</span>
            </div>
            {professionalDetails.map((item, index) => (
              <div className="emp-detail-inner" key={index}>
                <img src={item.icon} alt={item.label} />
                <div className="emp-detail">
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tmp-login-last">
          <div className="tmp-login-security login-security">
            <div className="login-img">
              <img src="/SVG/login-vec.svg" alt="prn" />
              <span>Login & Security Settings</span>
            </div>
            <div className="enter-field">
              <div className="enter-pass">
                <span>Username</span>
                <input type="text" value={employee.username || ""} readOnly />
              </div>
              <div className="enter-pass" style={{ position: "relative" }}>
                <span>Current Password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ paddingRight: "30px" }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#007bff",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>
          </div>
          <div className="tmp-50"></div>
        </div>
      </section>
    </>
  );
};

export default TeamMemberProfile;
