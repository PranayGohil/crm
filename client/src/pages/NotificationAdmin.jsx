import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import NotificationItem from "../components/NotificationItem";
import { NotificationContext } from "../contexts/NotificationContext";

const NotificationAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { notifications, markAllAsRead } = useContext(NotificationContext);

  useEffect(() => {
    markAllAsRead();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="notification-admin">
      <section className="not-notification-header">
        <div className="not-notification-header-txt">
          <span>Notification Center</span>
        </div>
        <div className="not-header-navbar">
          <a href="#" className="not-all-notification not-inner-nav">
            All Notifications
          </a>
          <a href="#" className="not-Task-Updates">
            Task Updates
          </a>
          <a href="#" className="not-Comments">
            Comments
          </a>
          <a href="#" className="not-Due-Dates">
            Due Dates
          </a>
          <a href="#" className="not-Media-Uploads">
            Media Uploads
          </a>
        </div>
      </section>

      <section className="not-sec-2">
        <div className="not-tasks-information">
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n, index) => (
              <NotificationItem
                key={n._id}
                icon={n.icon || "/SVG/default-vec.svg"}
                title={n.title}
                description={n.description}
                linkText="View"
                linkHref="#"
                time={new Date(n.createdAt).toLocaleString()}
                media={n.media}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default NotificationAdmin;
