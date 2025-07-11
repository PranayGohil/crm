import React, { useEffect, useState } from "react";
import axios from "axios";
import NotificationItem from "../components/NotificationItem";

const NotificationAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification/get-all`
        );
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
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
