import { useState, useEffect } from "react";

const HeaderEmployee = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setFullName(user.full_name);
      setProfilePic(user.profile_pic || "");
    }
  }, []);
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
              {/* <div className="ha_notification__header">
                <a href="employeenotificationpage">
                  <img src="SVG/notification.svg" alt="notification icon" />
                  <span className="ha_notification_count">10</span>
                </a>
              </div> */}

              <div className="ha-header-img-admin_name">
                {profilePic ? (
                  <img
                    src={`${profilePic}`}
                    alt={`${username}`}
                    className="ha_admin_name"
                  />
                ) : (
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
                )}
                <span>{fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderEmployee;
