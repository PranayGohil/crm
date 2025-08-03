// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/admin/LoadingOverlay";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    phone: "",
    profile_pic_preview: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/profile`
      );
      if (res.data.success) {
        setForm({
          ...res.data.admin,
          profile_pic_preview: res.data.admin.profile_pic || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    if (form.password && form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (profilePic) data.append("profile_pic", profilePic);

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/update-profile`,
        data
      );
      if (res.data.success) {
        alert("Profile updated!");
        fetchProfile();
      } else {
        setErrors({ general: res.data.message });
      }
    } catch (err) {
      setErrors({ general: err?.response?.data?.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <section className="employee_profile_edit_container p-3">
      <section className="page3-main1">
        <div className="member-profile-edit">
          <div className="pro-edit-vec">
            <img
              src="/SVG/vec-mem-pro.svg"
              alt="vec"
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
            />
            <span>Admin Profile</span>
          </div>
        </div>
      </section>
      {errors.general && (
        <div style={{ color: "red", marginLeft: "20px", marginTop: "10px" }}>
          {errors.general}
        </div>
      )}

      <section className="pe page3-main2">
        <div className="update-upload-profile">
          <div className="update-your-pro d-flex flex-column align-items-center">
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
                    handleChange("profile_pic_preview", previewUrl);
                  }
                }}
              />
            </div>
            <div>
              <div className="d-flex gap-3 mb-3">
                <div className="full-name">
                  <span>Username</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                  />
                  {errors.username && (
                    <div className="error">{errors.username}</div>
                  )}
                </div>
                <div className="full-name">
                  <span>Password</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {errors.password && (
                    <div className="error">{errors.password}</div>
                  )}
                </div>
              </div>
              <div className="d-flex gap-3">
                <div className="full-name">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <div className="error">{errors.email}</div>}
                </div>
                <div className="full-name">
                  <span>Phone</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  {errors.phone && <div className="error">{errors.phone}</div>}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
            <button className="btn btn-primary px-4" onClick={handleSubmit}>
              Save Changes
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default AdminProfile;
