import { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const HeaderEmployee = ({ onMenuToggle, showMenuButton }) => {
  const { notifications, setNotifications } = useSocket();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : "?";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setFullName(user.full_name);
      setProfilePic(user.profile_pic || "");
      fetchNotifications(user._id);
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async (employeeId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notification/get`, {
        params: { receiver_id: employeeId, receiver_type: "employee" },
        headers: { Authorization: `Bearer ${localStorage.getItem("employeeToken")}` },
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeUser");
    localStorage.removeItem("employeeToken");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">

        {/* Left — hamburger (mobile, managers only) + logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <img src="/SVG/diamond-rich_teal.svg" alt="logo" className="w-7 h-7 flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate hidden xs:block sm:block">
              Pixel Orbit
            </h1>
          </div>
        </div>

        {/* Right — notifications + profile */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">

          {/* Notifications bell */}
          <Link to="/notifications" className="relative flex-shrink-0">
            <img src="/SVG/notification.svg" alt="notification" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900 focus:outline-none"
            >
              {profilePic ? (
                <img src={profilePic} alt={username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0a3749] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {firstLetter}
                </div>
              )}
              {/* Name hidden on very small screens */}
              <span className="font-medium text-sm hidden sm:block truncate max-w-[120px]">{fullName}</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {/* Name shown in dropdown on mobile */}
                <div className="sm:hidden px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800 truncate mb-0">{fullName}</p>
                </div>
                {[
                  { to: "/profile", label: "Profile" },
                  { to: "/activity-history", label: "Activity History" },
                  { to: "/notification-settings", label: "Notification Settings" },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderEmployee;