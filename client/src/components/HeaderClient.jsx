import React from "react";
import { Link } from "react-router-dom";

const HeaderClient = () => {
  const storedUser = localStorage.getItem("clientUser");
  const clientUser = storedUser ? JSON.parse(storedUser) : null;
  const full_name = clientUser?.full_name || "";
  const username = clientUser?.username || "";

  const firstLetter = full_name ? full_name.charAt(0).toUpperCase() : "?";
  return (
    <div className="ha-header_client_main">
      <div className="ha-header_client_main_inner">
        <div className="ett-header">
          <div className="ett-header-inner">
            <div className="ha-header-maulshree-Jle d-flex justify-content-center align-items-center">
              <img src="/SVG/diamond-rich_teal.svg" alt="logo" />
              <h1 style={{ marginBottom: "0" }}>{full_name}</h1>
            </div>

            <div className="header-notification">
              <div className="ha_notification__header">
                <a href="ClientAdminNotificationPage">
                  <img src="/SVG/notification.svg" alt="notification icon" />
                  <span className="ha_notification_count">3</span>
                </a>
              </div>

              <Link
                to={`/profile`}
                className="ha-header-img-admin_name"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "rgb(10 55 73)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {firstLetter}
                </div>
                <span>{username}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderClient;
