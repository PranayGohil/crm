import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../contexts/SocketContext";

const HeaderAdmin = ({ onMenuToggle }) => {
  const { notifications, setNotifications } = useSocket();
  const navigate = useNavigate();
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
      if (!res.data.success) {
        navigate("/login");
        return;
      }
      setUser(res.data.admin);
      fetchNotifications(res.data.admin._id);
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/login");
    }
  };

  const fetchNotifications = async (adminId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notification/get`,
        {
          params: { receiver_id: adminId, receiver_type: "admin" },
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
    <header className="bg-white px-4 py-3 flex justify-between items-center gap-3">
      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger - only on mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo + Title */}
        <div className="flex items-center gap-2 min-w-0">
          <img src="/SVG/diamond-rich_teal.svg" alt="logo" className="w-7 h-7 flex-shrink-0" />
          <h1 className="text-base font-semibold text-gray-800 m-0 truncate hidden sm:block">
            Pixel Orbit
          </h1>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Notifications */}
        <div className="relative">
          <Link to="/notifications" className="relative block">
            <img src="/SVG/notification.svg" alt="notification" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
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
            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
          />
          {/* Username hidden on very small screens */}
          <span className="font-medium text-sm hidden sm:block truncate max-w-[120px]">
            {user?.username || "Admin"}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default HeaderAdmin;