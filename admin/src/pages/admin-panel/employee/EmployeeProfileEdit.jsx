import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmployeeProfileEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const dropdownOptions = ["medium", "low", "Pause", "Block", "Done"];
  const employmentTypes = ["Full-time", "Part-time"];
  const defaultManager = "Sarah Johnson (CTO)";

  const [employee, setEmployee] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/employee/get/${employeeId}`
        );
        setEmployee({
          ...res.data,
          designation: res.data.designation || "Senior Developer",
          status: res.data.status || "Active",
          department: res.data.department || "Engineering",
          employmentType: res.data.employmentType || employmentTypes[0],
          reportingManager: res.data.reportingManager || defaultManager,
        });
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };
    fetchEmployee();
  }, [employeeId]);

  const toggleDropdown = (type) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleSelect = (type, value) => {
    setEmployee((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };

  const handleChange = (field, value) => {
    setEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      handleChange("profile_pic", URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/employee/edit/${employeeId}`,
        employee
      );
      alert("Profile updated!");
      navigate(`/employee/profile/${employeeId}`);
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Update failed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!employee) return <p>Loading...</p>;

  return (
    <section className="employee_profile_edit_container">
      <section className="page3-main1">
        <div className="member-profile-edit">
          <div className="pro-edit-vec">
            <img src="/SVG/vec-mem-pro.svg" alt="vec" />
            <span>Edit Team Member Profile</span>
          </div>
          <div className="cancel-changes">
            <div className="theme_secondary_btn">
              <a onClick={() => navigate(-1)}>Cancel</a>
            </div>
            <div className="theme_btn">
              <a onClick={handleSave}>Save changes</a>
            </div>
          </div>
        </div>
      </section>

      <section className="pe page3-main2">
        <div className="update-upload-profile">
          <div className="update-your-pro">
            <div className="upadate-profile-img">
              <div className="update-img">
                {employee.profile_pic ? (
                  <img src={employee.profile_pic} alt="profile" />
                ) : (
                  <div className="profile-placeholder">
                    {employee.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="update-profile-detail">
              <div className="full-name">
                <span>Full Name</span>
                <input
                  type="text"
                  value={employee.full_name || ""}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>
              <div className="update-dropdown" ref={dropdownRef}>
                <div
                  className={`btn_main1 ${
                    openDropdown === "designation" ? "open" : ""
                  }`}
                >
                  <p>Designation</p>
                  <div
                    className="dropdown_toggle1"
                    onClick={() => toggleDropdown("designation")}
                  >
                    <div className="t-b-inner">
                      <span className="text_btn1">{employee.designation}</span>
                      <img
                        src="/SVG/header-vector.svg"
                        alt="vec"
                        className="arrow_icon1"
                      />
                    </div>
                  </div>
                  {openDropdown === "designation" && (
                    <ul className="dropdown_menu1">
                      {dropdownOptions.map((option, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelect("designation", option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div
                  className={`btn_main1 ${
                    openDropdown === "status" ? "open" : ""
                  }`}
                >
                  <p>Status</p>
                  <div
                    className="dropdown_toggle1"
                    onClick={() => toggleDropdown("status")}
                  >
                    <div className="t-b-inner">
                      <span className="text_btn1">{employee.status}</span>
                      <img
                        src="/SVG/header-vector.svg"
                        alt="vec"
                        className="arrow_icon1"
                      />
                    </div>
                  </div>
                  {openDropdown === "status" && (
                    <ul className="dropdown_menu1">
                      {dropdownOptions.map((option, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelect("status", option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="upload-profile">
            <div className="upload-img">
              <label>
                <img src="/SVG/upload-vec.svg" alt="upload" />
                <input type="file" hidden onChange={handleFileChange} />
              </label>
            </div>
            <span>Update Profile Picture</span>
          </div>
        </div>
      </section>

      <section className="personal-proffesional">
        <div className="profile-edit-header mem-personal-detail">
          <div className="profile-heading">
            <div className="profile-edit-heading personal-detail">
              <span>Personal Details</span>
            </div>
          </div>
          <div className="profile-inner">
            <div className="profile-edit-inner phone-num">
              <div className="profile-edit-detail phone-num-txt">
                <span>Phone Number</span>
                <input
                  type="text"
                  value={employee.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="profile-edit-inner email">
              <div className="profile-edit-detail mail-txt">
                <span>Email Address</span>
                <input
                  type="email"
                  value={employee.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="profile-edit-inner home-add">
              <div className="profile-edit-detail phone-num-txt">
                <span>Home Address</span>
                <input
                  type="text"
                  value={employee.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </div>
            <div className="profile-edit-inner date-of-birth">
              <div className="profile-edit-detail date-birth-txt">
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={employee.dob ? employee.dob.split("T")[0] : ""}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
              </div>
            </div>
            <div className="profile-edit-inner egn-contact">
              <div className="profile-edit-detail eng-cnt-txt">
                <span>Emergency Contact</span>
                <input
                  type="text"
                  value={employee.emergency_contact || ""}
                  onChange={(e) =>
                    handleChange("emergency_contact", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="profile-edit-header mem-professional-detail"
          ref={dropdownRef}
        >
          <div className="profile-heading">
            <div className="profile-edit-heading personal-detail">
              <span>Professional Details</span>
            </div>
          </div>
          <div className="profile-inner">
            <div className="profile-edit-inner emp-id">
              <div className="profile-edit-detail phone-num-txt">
                <span>Employee ID</span>
                <input
                  type="text"
                  value={employee.employee_id || ""}
                  onChange={(e) => handleChange("employee_id", e.target.value)}
                />
              </div>
            </div>

            {[
              { label: "Department", type: "department" },
              { label: "Designation", type: "designation" },
              { label: "Reporting Manager", type: "reportingManager" },
            ].map(({ label, type }) => (
              <div className={`profile-edit-inner emp-${type}`} key={type}>
                <div className="Department emp-detail mail-txt">
                  <p>{label}</p>
                  <div
                    className="dropdown_toggle2"
                    onClick={() => toggleDropdown(type)}
                  >
                    <span className="text_btn2">{employee[type]}</span>
                    <img
                      src="/SVG/header-vector.svg"
                      alt="vec"
                      className="arrow_icon2"
                    />
                  </div>
                  {openDropdown === type && (
                    <ul className="dropdown_menu2">
                      {dropdownOptions.map((option, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelect(type, option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            <div className="profile-edit-inner emp-doj">
              <div className="profile-edit-detail eng-cnt-txt">
                <span>Date of Joining</span>
                <input
                  type="date"
                  value={
                    employee.date_of_joining
                      ? employee.date_of_joining.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleChange("date_of_joining", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-edit-inner emp-salary">
              <div className="profile-edit-detail eng-cnt-txt">
                <span>Monthly Salary</span>
                <input
                  type="number"
                  value={employee.monthly_salary || ""}
                  onChange={(e) =>
                    handleChange("monthly_salary", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="profile-edit-inner emp-type">
              <div className="Department emp-detail mail-txt">
                <p>Employment Type</p>
                <div
                  className="dropdown_toggle2"
                  onClick={() => toggleDropdown("employmentType")}
                >
                  <span className="text_btn2">{employee.employmentType}</span>
                  <img
                    src="/SVG/header-vector.svg"
                    alt="vec"
                    className="arrow_icon2"
                  />
                </div>
                {openDropdown === "employmentType" && (
                  <ul className="dropdown_menu2">
                    {employmentTypes.map((type, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelect("employmentType", type)}
                      >
                        {type}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="login-security2">
        <div className="login-img">
          <span>Login & Security Settings</span>
        </div>
        <div className="pe-enter-pass pass-vec enter-pass">
          <span>Username</span>
          <input
            type="text"
            value={employee.username || ""}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </div>
        {["current", "new", "confirm"].map((field) => (
          <div className="pe-enter-pass enter-pass" key={field}>
            <span>
              {field === "current"
                ? "Current Password"
                : field === "new"
                ? "New Password"
                : "Confirm Password"}
            </span>
            <div className="pass-vec">
              <input
                type={showPasswords[field] ? "text" : "password"}
                onChange={(e) =>
                  handleChange(`${field}_password`, e.target.value)
                }
              />
              <img
                src="/SVG/password-vec.svg"
                alt="toggle"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    [field]: !prev[field],
                  }))
                }
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        ))}
        <button className="theme_btn">
          <a>Change Password</a>
        </button>
      </section>

      <section className="delete-account mg-delete-acc">
        <div className="delete-account-inner">
          <span>Delete Account</span>
        </div>
        <div className="warning-msg">
          <div className="warning-img">
            <img src="/SVG/warning-vec.svg" alt="warning-img" />
          </div>
          <div className="warning-txt">
            <p>Warning: This action cannot be undone</p>
            <span>
              Deleting this team member account will permanently remove all
              their data, access rights, and history.
            </span>
          </div>
        </div>
        <div className="delete-Account-btn text-light">
          <a>Delete Account</a>
        </div>
      </section>
    </section>
  );
};

export default EmployeeProfileEdit;
