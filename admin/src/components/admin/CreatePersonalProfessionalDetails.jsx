import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Options
const departmentOptions = ["SET Design", "CAD Design", "Render"];
const employmentTypes = ["Full-time", "Part-time"];

const CreatePersonalProfessionalDetails = ({ form, onChange, errors }) => {
  const [managers, setManagers] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/employee/managers`)
      .then((res) => {
        if (res.data.success) {
          console.log("Managers:", res.data.data);
          setManagers(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching managers", err));
  }, []);

  const toggleDropdown = (type) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleSelect = (key, value) => {
    onChange(key, value);
    setOpenDropdown(null);
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

  return (
    <section className="personal-proffesional">
      {/* Personal Details */}
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
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
              {errors?.phone && <div className="error">{errors.phone}</div>}
            </div>
          </div>

          <div className="profile-edit-inner email">
            <div className="profile-edit-detail mail-txt">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="riya.sharma@email.com"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
              {errors?.email && <div className="error">{errors.email}</div>}
            </div>
          </div>

          <div className="profile-edit-inner home-add">
            <div className="profile-edit-detail phone-num-txt">
              <span>Home Address</span>
              <input
                type="text"
                placeholder="123 Rose Villa, Sector 45, Jaipur"
                value={form.home_address}
                onChange={(e) => onChange("home_address", e.target.value)}
              />
              {errors?.home_address && (
                <div className="error">{errors.home_address}</div>
              )}
            </div>
          </div>

          <div className="profile-edit-inner date-of-birth">
            <div className="profile-edit-detail date-birth-txt">
              <span>Date of Birth</span>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => onChange("dob", e.target.value)}
              />
              {errors?.dob && <div className="error">{errors.dob}</div>}
            </div>
          </div>

          <div className="profile-edit-inner egn-contact">
            <div className="profile-edit-detail eng-cnt-txt">
              <span>Emergency Contact</span>
              <input
                type="text"
                placeholder="+91 9012345678 (Father)"
                value={form.emergency_contact}
                onChange={(e) => onChange("emergency_contact", e.target.value)}
              />
              {errors?.emergency_contact && (
                <div className="error">{errors.emergency_contact}</div>
              )}
            </div>
          </div>

          <div className="profile-edit-inner egn-contact">
            <div className="profile-edit-detail eng-cnt-txt">
              <span>Capacity</span>
              <input
                type="number"
                placeholder="Enter number of Capacity per Day"
                value={form.capacity}
                onChange={(e) => onChange("capacity", e.target.value)}
              />
              {errors?.capacity && (
                <div className="error">{errors.capacity}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details */}
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
          {/* Department Dropdown */}
          <div className="profile-edit-inner emp-department">
            <div className="Department emp-detail mail-txt">
              <p>Department</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("department")}
              >
                <span className="text_btn2">
                  {form.department || "Select Department"}
                </span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "department" && (
                <ul className="dropdown_menu2">
                  {departmentOptions.map((option, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect("department", option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
              {errors?.department && (
                <div className="error">{errors.department}</div>
              )}
            </div>
          </div>

          {/* Reporting Manager Dropdown */}
          <div className="profile-edit-inner emp-reportingManager">
            <div className="Department emp-detail mail-txt">
              <p>Reporting Manager</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("reporting_manager")}
              >
                <span className="text_btn2">
                  {form.reporting_manager
                    ? managers.find((m) => m._id === form.reporting_manager)
                        ?.full_name
                    : "Select Manager"}
                </span>

                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "reporting_manager" && (
                <ul className="dropdown_menu2">
                  <li onClick={() => handleSelect("reporting_manager", "")}>
                    Select Manager
                  </li>
                  {managers.map((option, idx) => (
                    <li
                      key={idx}
                      onClick={
                        () => handleSelect("reporting_manager", option._id) // 👈 save ObjectId instead of name
                      }
                    >
                      {option.full_name}
                    </li>
                  ))}
                </ul>
              )}
              {errors?.reporting_manager && (
                <div className="error">{errors.reporting_manager}</div>
              )}
            </div>
          </div>

          <div className="profile-edit-inner emp-doj">
            <div className="profile-edit-detail eng-cnt-txt">
              <span>Date of Joining</span>
              <input
                type="date"
                value={form.date_of_joining}
                onChange={(e) => onChange("date_of_joining", e.target.value)}
              />
              {errors?.date_of_joining && (
                <div className="error">{errors.date_of_joining}</div>
              )}
            </div>
          </div>

          <div className="profile-edit-inner emp-salary">
            <div className="profile-edit-detail eng-cnt-txt">
              <span>Monthly Salary</span>
              <input
                type="number"
                placeholder="75,000"
                value={form.monthly_salary}
                onChange={(e) => onChange("monthly_salary", e.target.value)}
              />
              {errors?.monthly_salary && (
                <div className="error">{errors.monthly_salary}</div>
              )}
            </div>
          </div>

          {/* Employment Type Dropdown */}
          <div className="profile-edit-inner emp-type">
            <div className="Department emp-detail mail-txt">
              <p>Employment Type</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("employment_type")}
              >
                <span className="text_btn2">
                  {form.employment_type || "Select Employment Type"}
                </span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "employment_type" && (
                <ul className="dropdown_menu2">
                  {employmentTypes.map((type, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect("employment_type", type)}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              )}
              {errors?.employment_type && (
                <div className="error">{errors.employment_type}</div>
              )}
            </div>
          </div>
          <div className="profile-edit-inner is-manager-checkbox">
            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_manager}
                  onChange={(e) => onChange("is_manager", e.target.checked)}
                />
                <span style={{ marginLeft: "8px" }}>Is Reporting Manager</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePersonalProfessionalDetails;
