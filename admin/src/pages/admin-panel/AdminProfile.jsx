// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EMPTY_ERRORS = {};

const AdminProfile = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "", username: "", password: "", phone: "", profile_pic_preview: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/profile`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        setRole(res.data.admin.role);
        setForm({ ...res.data.admin, profile_pic_preview: res.data.admin.profile_pic || "" });
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.username?.trim()) errs.username = "Username is required.";
    if (!form.email?.trim()) errs.email = "Email is required.";
    if (!form.phone?.trim()) errs.phone = "Phone number is required.";
    if (form.password && form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    return errs;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    setErrors(EMPTY_ERRORS);

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (profilePic) data.append("profile_pic", profilePic);

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/update-profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => { setSuccessMsg(""); window.location.reload(); }, 1200);
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

  const isSuperAdmin = role === "super-admin";

  return (
    <section className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Admin Profile</h1>
          </div>

          {/* Super-admin quick links */}
          {isSuperAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/manage-admins"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 100-8 4 4 0 000 8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20a6 6 0 0112 0" />
                </svg>
                <span className="hidden xs:inline">Manage Admins</span>
                <span className="xs:hidden">Admins</span>
              </Link>
              <Link
                to="/activity-logs"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.05 11a9 9 0 111.7 5.3M3 4v5h5" />
                </svg>
                <span className="hidden xs:inline">Activity Logs</span>
                <span className="xs:hidden">Logs</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {errors.general}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {successMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white shadow rounded-xl p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <label
            htmlFor="profilePic"
            className="cursor-pointer relative group"
            title="Click to change photo"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-gray-100 group-hover:border-blue-400 transition-colors">
              <img
                src={form.profile_pic_preview || "/SVG/upload-vec.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 border-2 border-white group-hover:bg-blue-700 transition-colors">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.036-6.036a2 2 0 012.828 2.828L11.828 13.828 9 14l.172-2.828z" />
              </svg>
            </div>
          </label>
          <input
            type="file"
            id="profilePic"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setProfilePic(file);
                handleChange("profile_pic_preview", URL.createObjectURL(file));
              }
            }}
          />
          <p className="text-xs text-gray-400 mt-2">Click photo to change</p>
          {role && (
            <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {role}
            </span>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Username + Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-gray-400 font-normal">(leave blank to keep)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminProfile;