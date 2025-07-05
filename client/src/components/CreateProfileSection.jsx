import React, { useState, useEffect, useRef } from "react";

const designationOptions = ["Senior Developer", "Junior Developer", "Manager"];
const statusOptions = ["Active", "Inactive", "Blocked"];

const CreateProfileSection = ({ form, onChange, setProfilePic }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

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
    <section className="pe page3-main2">
      <div className="update-upload-profile">
        <div className="update-your-pro">
          <div className="upadate-profile-img">
            <div className="update-img">
              <img
                src={form.profile_pic_preview || "/Image/prn1.png"}
                alt="prn1"
              />
            </div>
          </div>
          <div className="update-profile-detail">
            <div className="full-name">
              <span>Full Name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => onChange("full_name", e.target.value)}
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
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "designation" ? null : "designation"
                    )
                  }
                >
                  <div className="t-b-inner">
                    <span className="text_btn1">{form.designation}</span>
                    <img
                      src="/SVG/header-vector.svg"
                      alt="vec"
                      className="arrow_icon1"
                    />
                  </div>
                </div>
                {openDropdown === "designation" && (
                  <ul className="dropdown_menu1">
                    {designationOptions.map((option, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          onChange("designation", option);
                          setOpenDropdown(null);
                        }}
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
                  onClick={() =>
                    setOpenDropdown(openDropdown === "status" ? null : "status")
                  }
                >
                  <div className="t-b-inner">
                    <span className="text_btn1">{form.status}</span>
                    <img
                      src="/SVG/header-vector.svg"
                      alt="vec"
                      className="arrow_icon1"
                    />
                  </div>
                </div>
                {openDropdown === "status" && (
                  <ul className="dropdown_menu1">
                    {statusOptions.map((option, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          onChange("status", option);
                          setOpenDropdown(null);
                        }}
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
          <label htmlFor="profilePic" className="upload-img">
            <img src="/SVG/upload-vec.svg" alt="upload" />
          </label>
          <input
            type="file"
            id="profilePic"
            style={{ display: "none" }}
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
          <span>Update Profile Picture</span>
        </div>
      </div>
    </section>
  );
};

export default CreateProfileSection;
