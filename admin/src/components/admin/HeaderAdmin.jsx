import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../contexts/SocketContext";

const HeaderAdmin = () => {
  const { notifications, setNotifications } = useSocket();
  const user = JSON.parse(localStorage.getItem("adminUser"));

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
    if (user) {
      fetchNotifications(user._id);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="ha-header_admin_main">
      <div className="ha-header_admin_main_inner">
        <div className="ett-header">
          <div className="ett-header-inner">
            <div className="ha-header-maulshree-Jle">
              <img src="/SVG/diamond-rich_teal.svg" alt="d1" />
              <h1 style={{ marginBottom: "0" }}>Maulshree Jewellery</h1>
            </div>

            <div className="header-notification">
              <div className="ha_notification__header">
                <a href="/notifications">
                  <img src="/SVG/notification.svg" alt="notification icon" />
                  {unreadCount > 0 && (
                    <span className="ha_notification_count">{unreadCount}</span>
                  )}
                </a>
              </div>

              <Link
                to="/admin/profile"
                className="ha-header-img-admin_name d-flex align-items-center"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={user?.profile_pic || "/SVG/default-profile.svg"}
                  alt="riya sharma"
                  className="ha_admin_name"
                />
                <span>{user?.username || "Admin"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderAdmin;
