import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const statusOptions = ["Active", "Inactive", "Blocked"];

const CreateProfileSection = ({ form, onChange, setProfilePic, errors }) => {
  const [designations, setDesignations] = useState([]);
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

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/designation/get-all`)
      .then((res) => {
        if (res.data.success) {
          console.log("get all designations", res.data.designations);
          setDesignations(res.data.designations);
        } else {
          console.error("Failed to fetch designations");
        }
      })
      .catch((err) => console.error("Error fetching designations", err));
  }, []);

  return (
    <section className="pe page3-main2">
      <div className="update-upload-profile">
        <div className="update-your-pro">
          <div className="upload-profile">
            <label
              htmlFor="profilePic"
              className="upload-img"
              style={{
                cursor: "pointer",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid #d1d5db",
              }}
            >
              <img
                src={form.profile_pic_preview || "/SVG/upload-vec.svg"}
                alt="upload"
                style={{ width: "100%", objectFit: "cover", height: "100%" }}
              />
            </label>
            <input
              type="file"
              id="profilePic"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setProfilePic(file);
                  const previewUrl = URL.createObjectURL(file);
                  onChange("profile_pic_preview", previewUrl);
                }
              }}
            />
          </div>
          <div className="update-profile-detail d-flex">
            <div className="full-name">
              <span>Full Name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => onChange("full_name", e.target.value)}
              />
              {errors.full_name && (
                <div className="error">{errors.full_name}</div>
              )}
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
                    <span className="text_btn1">
                      {form.designation || "Select option"}
                    </span>
                    <img
                      src="/SVG/header-vector.svg"
                      alt="vec"
                      className="arrow_icon1"
                    />
                  </div>
                </div>
                {openDropdown === "designation" && (
                  <ul className="dropdown_menu1">
                    {designations.map((option, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          onChange("designation", option.name);
                          setOpenDropdown(null);
                        }}
                      >
                        {option.name}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.designation && (
                  <div className="error">{errors.designation}</div>
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
                    <span className="text_btn1">
                      {form.status || "Select option"}
                    </span>
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
                {errors.status && <div className="error">{errors.status}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateProfileSection;
