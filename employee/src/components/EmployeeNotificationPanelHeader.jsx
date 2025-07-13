import React from 'react';

const EmployeeNotificationPanelHeader = () => {
  return (
    <section className="not-notification-header">
      <div className="not-notification-header-txt">
        <span>Notification Center</span>
        <div className="not-header-menu">
          <a href="#" className="not-header-filter">
            <img src="/SVG/filter-vector.svg" alt="filter" /> Filter
          </a>
          <a href="#" className="not-header-setting">
            <img src="/SVG/setting-vec.svg" alt="setting" /> Notification Settings
          </a>
        </div>
      </div>
      {/* <div className="not-header-navbar">
        <a href="#" className="not-all-notification not-inner-nav">All Notifications</a>
        <a href="#" className="not-Task-Updates">Task Updates</a>
        <a href="#" className="not-Comments">Comments</a>
        <a href="#" className="not-Due-Dates">Due Dates</a>
        <a href="#" className="not-Media-Uploads">Media Uploads</a>
      </div> */}
    </section>
  );
};

export default EmployeeNotificationPanelHeader;
