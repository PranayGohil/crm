import React from "react";

const HeaderEmployee = () => {
  return (
    <div className="ha-header_admin_main">
      <div className="ha-header_admin_main_inner">
        <div className="ett-header">
          <div className="ett-header-inner">
            <div className="ha-header-maulshree-Jle">
              <img src="/SVG/diamond-rich_teal.svg" alt="d1" />
              <h1>Maulshree Jewellery</h1>
            </div>

            <div className="header-notification">
              <div className="ha_notification__header">
                <a href="employeenotificationpage">
                  <img src="SVG/notification.svg" alt="notification icon" />
                  <span className="ha_notification_count">10</span>
                </a>
              </div>

              <div className="ha-header-img-admin_name">
                <img
                  src="Image/Riya Sharma.png"
                  alt="riya sharma"
                  className="ha_admin_name"
                />
                <p>Employee Name</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderEmployee;
