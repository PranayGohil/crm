// src/pages/admin/ManageAdmins.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LoadingOverlay from "../../components/admin/LoadingOverlay";
import { FaEdit, FaTrash, FaPlus, FaUserShield, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

const ManageAdmins = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        phone: ""
    });
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setAdmins(res.data.admins);
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();

            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (profilePic) {
                formDataToSend.append("profile_pic", profilePic);
            }

            let url = `${process.env.REACT_APP_API_URL}/api/admin/create`;
            let method = "post";

            if (editingAdmin) {
                url = `${process.env.REACT_APP_API_URL}/api/admin/${editingAdmin._id}`;
                method = "put";
            }

            const res = await axios[method](url, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                setShowModal(false);
                setEditingAdmin(null);
                setFormData({ username: "", email: "", password: "", phone: "" });
                setProfilePic(null);
                fetchAdmins();
            }
        } catch (error) {
            console.error("Error saving admin:", error);
            alert(error.response?.data?.message || "Error saving admin");
        }
    };

    const handleDelete = async (adminId) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/admin/${adminId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                fetchAdmins();
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
            alert(error.response?.data?.message || "Error deleting admin");
        }
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            email: admin.email,
            phone: admin.phone || "",
            password: "" // Don't show password
        });
        setShowModal(true);
    };

    if (loading) return <LoadingOverlay />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Admins</h1>
                {user?.role === "super-admin" && (
                    <button
                        onClick={() => {
                            setEditingAdmin(null);
                            setFormData({ username: "", email: "", password: "", phone: "" });
                            setProfilePic(null);
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <FaPlus /> Add New Admin
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <div key={admin._id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                                <img
                                    src={admin.profile_pic || "/SVG/reg-upload-photo.svg"}
                                    alt={admin.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{admin.username}</h3>
                                <p className="text-sm text-gray-600">{admin.email}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full mt-1 ${admin.role === "super-admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {admin.role === "super-admin" ? <FaUserShield /> : <FaUser />}
                                    {admin.role === "super-admin" ? "Super Admin" : "Admin"}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">Phone: {admin.phone || "N/A"}</p>
                        {admin.createdBy && (
                            <p className="text-xs text-gray-500 mb-4">
                                Created by: {admin.createdBy.username}
                            </p>
                        )}

                        {/* Only show actions for non-super-admin and if current user is super-admin */}
                        {user?.role === "super-admin" && admin.role !== "super-admin" && (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => openEditModal(admin)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingAdmin ? "Edit Admin" : "Add New Admin"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Username*</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            {!editingAdmin && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Password*</label>
                                    <div className="relative">
                                        <input
                                            type={`${showPassword ? "text" : "password"}`}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingAdmin}
                                            className="w-full p-2 border rounded"
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
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