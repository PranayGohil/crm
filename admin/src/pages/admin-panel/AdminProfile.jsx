// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
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
        window.location.reload();
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
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-lg mr-4 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Admin Profile
            </h1>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="text-red-500 mb-4">{errors.general}</div>
      )}

      {/* Profile Section */}
      <div className="flex flex-col items-center bg-white shadow rounded-xl p-6 mx-auto">
        {/* Profile Picture */}
        <div className="mb-4">
          <label
            htmlFor="profilePic"
            className="cursor-pointer w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100"
          >
            <img
              src={form.profile_pic_preview || "/SVG/upload-vec.svg"}
              alt="upload"
              className="w-full h-full object-cover"
            />
          </label>
          <input
            type="file"
            id="profilePic"
            hidden
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

        {/* Form Fields */}
        <div className="w-full space-y-4">
          {/* Username + Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.username && (
                <div className="text-red-500 text-sm">{errors.username}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <div className="text-red-500 text-sm">{errors.password}</div>
              )}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.email && (
                <div className="text-red-500 text-sm">{errors.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.phone && (
                <div className="text-red-500 text-sm">{errors.phone}</div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminProfile;
