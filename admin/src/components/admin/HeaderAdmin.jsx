import React, { useContext } from "react";
import { Link } from "react-router-dom";
// import { NotificationContext } from "../../contexts/NotificationContext";

const HeaderAdmin = () => {
  // const { unreadCount } = useContext(NotificationContext);

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
                  {/* {unreadCount > 0 && (
                    <span className="ha_notification_count">{unreadCount}</span>
                  )} */}
                </a>
              </div>

              <Link to="/admin/profile" className="ha-header-img-admin_name d-flex align-items-center">
                <img
                  src="/Image/Riya Sharma.png"
                  alt="riya sharma"
                  className="ha_admin_name"
                />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderAdmin;
