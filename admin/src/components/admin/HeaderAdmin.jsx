import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../contexts/SocketContext";

const HeaderAdmin = () => {
  const { notifications, setNotifications } = useSocket();
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(res.data.admin);
      fetchNotifications(res.data.admin._id);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchNotifications = async (adminId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notification/get`,
        {
          params: {
            receiver_id: adminId,
            receiver_type: "admin",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white px-6 py-3 flex justify-between items-center">
      {/* Left Section - Logo + Title */}
      <div className="flex items-center gap-3">
        <img src="/SVG/diamond-rich_teal.svg" alt="logo" className="w-8 h-8" />
        <h1 className="text-lg font-semibold text-gray-800 m-0">
          {/* Maulshree Jewellery */}
          Pixel Orbit
        </h1>
      </div>

      {/* Right Section - Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <Link to="/notifications" className="relative">
            <img
              src="/SVG/notification.svg"
              alt="notification"
              className="w-5 h-5"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Profile */}
        <Link
          to="/admin/profile"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <img
            src={user?.profile_pic || "/SVG/default-profile.svg"}
            alt="admin"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
          <span className="font-medium">{user?.username || "Admin"}</span>
        </Link>
      </div>
    </header>
  );
};

export default HeaderAdmin;
