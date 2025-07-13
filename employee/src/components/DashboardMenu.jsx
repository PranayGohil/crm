import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const DashboardMenu = () => {
  const location = useLocation(); // get current route
  const menuRef = useRef(null);
  const arrowBtnRef = useRef(null);
  const arrowImgRef = useRef(null);

  useEffect(() => {
    const handleArrowClick = () => {
      menuRef.current.classList.toggle("collapsed");
      arrowImgRef.current.classList.toggle("rotated");
    };

    const arrowBtn = arrowBtnRef.current;
    arrowBtn.addEventListener("click", handleArrowClick);

    return () => {
      arrowBtn.removeEventListener("click", handleArrowClick);
    };
  }, []);

  // helper: check if current path starts with string
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <div className="right-arrow-dashboard-main">
        <div className="right-arrow-dashboard" ref={arrowBtnRef}>
          <div>
            <img
              src="/SVG/right-arrow.svg"
              alt="right-arrow"
              ref={arrowImgRef}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-menu-main" ref={menuRef}>
        <div className="dashboard-menu-main-inner-first">
          <div className="main-dashboard-para-icon">
            <div className="main-dashboard-icon">
              <img src="/SVG/dashboard-main.svg" alt="dashboard-main-icon" />
            </div>
            <div className="main-dashboard-para">Dashboard Pro</div>
          </div>

          <div className="dashboard-content-main">
            <div className="home-dashboard">
              <Link
                to="/dashboard"
                className={`common-icon-para ${
                  isActive("/dashboard") ? "active-link" : ""
                }`}
              >
                <img src="/SVG/home-dashboard.svg" alt="home-dashboard" />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="commen-dashboard-list">
              <p>Projects</p>
              <div className="commen-dashboard-list-inner">
                <Link
                  to="/project/dashboard"
                  className={`common-icon-para ${
                    isActive("/project") ? "active-link" : ""
                  }`}
                >
                  <img src="/SVG/project.svg" alt="project" />
                  <span>All Projects</span>
                </Link>
              </div>
            </div>

            <div className="commen-dashboard-list">
              <p>Tasks</p>
              <div className="commen-dashboard-list-inner">
                <Link
                  to="/tasktimeboard"
                  className={`common-icon-para ${
                    isActive("/tasktimeboard") ? "active-link" : ""
                  }`}
                >
                  <img src="/SVG/task-managment.svg" alt="task" />
                  <span>Task Management</span>
                </Link>
              </div>
            </div>

            <div className="commen-dashboard-list">
              <p>Clients</p>
              <div className="commen-dashboard-list-inner">
                <Link
                  to="/client/dashboard"
                  className={`common-icon-para ${
                    isActive("/client") ? "active-link" : ""
                  }`}
                >
                  <img src="/SVG/client.svg" alt="client" />
                  <span>All Clients</span>
                </Link>
              </div>
            </div>

            <div className="commen-dashboard-list">
              <p>Reports</p>
              <div className="commen-dashboard-list-inner">
                <Link
                  to="/timetrackingdashboard"
                  className={`common-icon-para ${
                    isActive("/timetrackingdashboard") ? "active-link" : ""
                  }`}
                >
                  <img src="/SVG/reports.svg" alt="reports" />
                  <span>Team Time Tracking</span>
                </Link>
              </div>
            </div>

            <div className="commen-dashboard-list">
              <p>Team</p>
              <div className="commen-dashboard-list-inner">
                <Link
                  to="/teammemberdashboard"
                  className={`common-icon-para ${
                    isActive("/teammemberdashboard") ? "active-link" : ""
                  }`}
                >
                  <img src="/SVG/team-member.svg" alt="team" />
                  <span>Team Members</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-menu-main-inner-second">
          <div className="user-profile-view">
            <img src="/Image/user.jpg" alt="user" />
            <div className="user-info-main">
              <span>John Doe</span>
              <p>Administrator</p>
            </div>
          </div>
          <div>
            <Link to="/login" className="logout-bar">
              <img src="/SVG/logout.svg" alt="logout" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMenu;
