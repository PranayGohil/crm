// src/pages/admin/ManageAdmins.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { FaEdit, FaTrash, FaPlus, FaUserShield, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const ManageAdmins = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", password: "", phone: "" });
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) setAdmins(res.data.admins);
        } catch (err) {
            console.error("Error fetching admins:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setProfilePic(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const fd = new FormData();
            Object.keys(formData).forEach((k) => { if (formData[k]) fd.append(k, formData[k]); });
            if (profilePic) fd.append("profile_pic", profilePic);

            const url = editingAdmin
                ? `${process.env.REACT_APP_API_URL}/api/admin/${editingAdmin._id}`
                : `${process.env.REACT_APP_API_URL}/api/admin/create`;
            const method = editingAdmin ? "put" : "post";

            const res = await axios[method](url, fd, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                setShowModal(false);
                setEditingAdmin(null);
                setFormData({ username: "", email: "", password: "", phone: "" });
                setProfilePic(null);
                fetchAdmins();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error saving admin");
        }
    };

    const handleDelete = async (adminId) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/${adminId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) fetchAdmins();
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting admin");
        }
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setFormData({ username: admin.username, email: admin.email, phone: admin.phone || "", password: "" });
        setShowModal(true);
    };

    if (loading) return <LoadingOverlay />;

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Manage Admins</h1>
                    {user?.role === "super-admin" && (
                        <button
                            onClick={() => {
                                setEditingAdmin(null);
                                setFormData({ username: "", email: "", password: "", phone: "" });
                                setProfilePic(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="text-xs" />
                            <span className="hidden sm:inline">Add New Admin</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Admin cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {admins.map((admin) => (
                    <div key={admin._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                                <img
                                    src={admin.profile_pic || "/SVG/reg-upload-photo.svg"}
                                    alt={admin.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">{admin.username}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{admin.email}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full mt-1 ${admin.role === "super-admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {admin.role === "super-admin" ? <FaUserShield /> : <FaUser />}
                                    {admin.role === "super-admin" ? "Super Admin" : "Admin"}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-1">Phone: {admin.phone || "N/A"}</p>
                        {admin.createdBy && (
                            <p className="text-xs text-gray-400 mb-4">Created by: {admin.createdBy.username}</p>
                        )}

                        {user?.role === "super-admin" && admin.role !== "super-admin" && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button onClick={() => openEditModal(admin)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                    <FaEdit className="text-xs" /> Edit
                                </button>
                                <button onClick={() => handleDelete(admin._id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <FaTrash className="text-xs" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            {editingAdmin ? "Edit Admin" : "Add New Admin"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={labelCls}>Profile Picture</label>
                                <input type="file" onChange={handleFileChange} accept="image/*"
                                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>

                            <div>
                                <label className={labelCls}>Username *</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange}
                                    required className={inputCls} />
                            </div>

                            <div>
                                <label className={labelCls}>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    required className={inputCls} />
                            </div>

                            {!editingAdmin && (
                                <div>
                                    <label className={labelCls}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} name="password"
                                            value={formData.password} onChange={handleInputChange}
                                            required className={inputCls + " pr-10"} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={labelCls}>Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                                    className={inputCls} />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    {editingAdmin ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmins;