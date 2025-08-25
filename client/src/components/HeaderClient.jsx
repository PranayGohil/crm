import React from "react";
import { Link } from "react-router-dom";

const HeaderClient = () => {
  const storedUser = localStorage.getItem("clientUser");
  const clientUser = storedUser ? JSON.parse(storedUser) : null;
  const full_name = clientUser?.full_name || "";
  const username = clientUser?.username || "";

  const firstLetter = full_name ? full_name.charAt(0).toUpperCase() : "?";

  return (
    <div className="bg-white px-6 py-3 flex flex-col sm:flex-row justify-between items-center">
      {/* Left Section - Logo + Title */}
      <div className="flex items-center gap-3">
        <img src="/SVG/diamond-rich_teal.svg" alt="logo" className="w-8 h-8" />
        <h1 className="text-lg font-semibold text-gray-800 m-0">
          Maulshree Jewellery
        </h1>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-6 sm:pt-0 pt-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          {/* Profile Icon / First Letter */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-900 text-white flex items-center justify-center text-sm sm:text-base font-bold uppercase">
            {firstLetter}
          </div>
          {/* Full Name */}
          <span className="sm:inline font-medium">{full_name}</span>
        </Link>
      </div>
    </div>
  );
};

export default HeaderClient;
