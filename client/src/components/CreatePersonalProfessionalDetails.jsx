import React, { useState, useEffect, useRef } from "react";

// Options
const departmentOptions = ["Engineering", "Design", "Marketing"];
const designationOptions = ["Senior Developer", "Junior Developer", "Manager"];
const managerOptions = ["Sarah Johnson (CTO)", "David Lee (PM)"];
const employmentTypes = ["Full-time", "Part-time"];

const CreatePersonalProfessionalDetails = ({ form, onChange }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

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
            </div>
          </div>
          <div className="profile-edit-inner egn-contact">
            <div className="profile-edit-detail eng-cnt-txt">
              <span>Emergency Contact</span>
              <input
                type="text"
                placeholder="+91 9012345678 (Father)"
                value={form.emrgency_contact}
                onChange={(e) => onChange("emrgency_contact", e.target.value)}
              />
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
          <div className="profile-edit-inner emp-id">
            <div className="profile-edit-detail phone-num-txt">
              <span>Employee ID</span>
              <input
                type="text"
                placeholder="EMP2341"
                value={form.employee_id}
                onChange={(e) => onChange("employee_id", e.target.value)}
              />
            </div>
          </div>

          {/* Department Dropdown */}
          <div className="profile-edit-inner emp-department">
            <div className="Department emp-detail mail-txt">
              <p>Department</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("department")}
              >
                <span className="text_btn2">{form.department}</span>
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
            </div>
          </div>

          {/* Designation Dropdown */}
          <div className="profile-edit-inner emp-designation">
            <div className="Department emp-detail mail-txt">
              <p>Designation</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("designation")}
              >
                <span className="text_btn2">{form.designation}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "designation" && (
                <ul className="dropdown_menu2">
                  {designationOptions.map((option, idx) => (
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
          </div>

          {/* Reporting Manager Dropdown */}
          <div className="profile-edit-inner emp-reportingManager">
            <div className="Department emp-detail mail-txt">
              <p>Reporting Manager</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("reporting_manager")}
              >
                <span className="text_btn2">{form.reporting_manager}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "reporting_manager" && (
                <ul className="dropdown_menu2">
                  {managerOptions.map((option, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect("reporting_manager", option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
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
            </div>
          </div>

          {/* Employment Type Dropdown */}
          <div className="profile-edit-inner emp-type">
            <div className="Department emp-detail mail-txt">
              <p>Employment Type</p>
              <div
                className="dropdown_toggle2"
                onClick={() => toggleDropdown("employement_type")}
              >
                <span className="text_btn2">{form.employement_type}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="vec"
                  className="arrow_icon2"
                />
              </div>
              {openDropdown === "employement_type" && (
                <ul className="dropdown_menu2">
                  {employmentTypes.map((type, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect("employement_type", type)}
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
  );
};

export default CreatePersonalProfessionalDetails;
