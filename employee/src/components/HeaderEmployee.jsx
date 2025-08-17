import { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const HeaderEmployee = () => {
  const { notifications, setNotifications } = useSocket();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setFullName(user.full_name);
      setProfilePic(user.profile_pic || "");
      fetchNotifications(user._id);
    }

    // Close dropdown when clicking outside
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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notification/get`,
        {
          params: {
            receiver_id: employeeId,
            receiver_type: "employee",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("employeeToken")}`,
          },
        }
      );
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

  // Count unread in real-time
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/SVG/diamond-rich_teal.svg"
            alt="logo"
            className="w-8 h-8"
          />
          <h1 className="text-lg font-semibold">Maulshree Jewellery</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <Link to="/notifications" className="relative">
            <img
              src="/SVG/notification.svg"
              alt="notification"
              className="w-5 h-5"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900 focus:outline-none"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0a3749] text-white flex items-center justify-center text-sm font-bold">
                  {firstLetter}
                </div>
              )}
              <span className="font-medium">{fullName}</span>
              <svg
                className={`w-4 h-4 transform transition ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
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
