import React from "react";

const notifications = [
  {
    type: "user",
    avatar: "Image/user2.jpg",
    name: "Riya Sharma",
    action: "completed task",
    task: "CAD Rendering",
    time: "10 mins ago",
    subtext: "Task completed ahead of schedule",
  },
  {
    type: "icon",
    icon: "SVG/clock.svg",
    task: "3D Modeling",
    time: "1 hour ago",
    subtext: "Task is now overdue",
    strong: "Due date reached for task",
  },
  {
    type: "user",
    avatar: "Image/user.jpg",
    name: "Ankit Bhatt",
    action: "added a comment on",
    task: "Stone Planning",
    time: "3 hours ago",
    subtext: `"We need to revise the material selection for the east wing."`,
  },
  {
    type: "user",
    avatar: "Image/user3.jpg",
    name: "Raj Kumar",
    action: "updated task status to",
    task: "Completed",
    taskClass: "md_notify_status_completed",
    time: "Yesterday",
    subtext: "All deliverables have been submitted",
  },
];

const NotificationPanel = () => {
  return (
    <section>
      <div className="md_notify_panel">
        {/* Header with tabs */}
        <div className="md_notify_panel_para_tab">
          <h2>Notifications</h2>
          <div className="md_notify_tabs">
            <a href="#" className="md_notify_tab md_notify_tab_active">
              All
            </a>
            <a href="#" className="md_notify_tab">
              Task Updates
            </a>
            <a href="#" className="md_notify_tab">
              Comments
            </a>
            <a href="#" className="md_notify_tab">
              Deadlines
            </a>
          </div>
        </div>

        {/* Notification Items */}
        <div className="md_notify_items_body">
          {notifications.map((note, index) => (
            <div className="md_notify_item" key={index}>
              {note.type === "user" ? (
                <img
                  src={note.avatar}
                  alt={note.name}
                  className="md_notify_avatar"
                />
              ) : (
                <div className="md_notify_item_img">
                  <img
                    src={note.icon}
                    alt="icon"
                    className="md_notify_overdue_icon"
                  />
                </div>
              )}

              <div className="md_notify_items_para_txt">
                <div className="md_notify_content">
                  <p>
                    {note.name && (
                      <>
                        <span className="md_notify_name md_notify__strong">
                          {note.name}
                        </span>{" "}
                        {note.action}{" "}
                      </>
                    )}
                    {note.strong && <strong>{note.strong} </strong>}
                    <span
                      className={`md_notify_task md_notify__strong ${
                        note.taskClass || ""
                      }`}
                    >
                      '{note.task}'
                    </span>
                  </p>
                  <span className="md_notify_time">{note.time}</span>
                </div>
                <p className="md_notify_subtext">{note.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="md_notify_footer">
          {/* <a href="#">Mark all as read</a> */}
          <a href="#" className="md_notify_view_all">
            View all notifications
          </a>
        </div>
      </div>
    </section>
  );
};

export default NotificationPanel;
