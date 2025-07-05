import React from "react";

const UpcomingDueDates = () => {
  const dueTasks = [
    {
      task: "CAD Rendering",
      project: "Modern Villa Design",
      dueDate: "Today",
      dueClass: "md-due-today",
      userImage: "Image/user.jpg",
      userName: "Rahul Sharma",
      status: "In Progress",
      statusClass: "md-status-progress"
    },
    {
      task: "CAD Rendering",
      project: "Modern Villa Design",
      dueDate: "Today",
      dueClass: "md-due-today",
      userImage: "Image/user.jpg",
      userName: "Rahul Sharma",
      status: "Blocked",
      statusClass: "md-status-blocked"
    },
    {
      task: "CAD Rendering",
      project: "Modern Villa Design",
      dueDate: "Yesterday",
      dueClass: "md-due-today",
      userImage: "Image/user.jpg",
      userName: "Rahul Sharma",
      status: "Completed",
      statusClass: "md-status-completed"
    },
    {
      task: "CAD Rendering",
      project: "Modern Villa Design",
      dueDate: "Jun 05, 2025",
      dueClass: "",
      userImage: "Image/user.jpg",
      userName: "Rahul Sharma",
      status: "To Do",
      statusClass: "md-status-todo"
    },
    {
      task: "CAD Rendering",
      project: "Modern Villa Design",
      dueDate: "Jun 05, 2025",
      dueClass: "",
      userImage: "Image/user.jpg",
      userName: "Rahul Sharma",
      status: "Paused",
      statusClass: "md-status-review"
    }
  ];

  return (
    <section className="md-overview-upcoming-due-date">
      <div className="md-overview-upcoming-due-date-inner">
        <div className="md-upcomoing-header-btn">
          <h2>Upcoming Due Dates</h2>
          <a href="#">View All</a>
        </div>

        <div className="md-overview-upcoming-table">
          <table className="md-table-container">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Project</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dueTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.task}</td>
                  <td>{task.project}</td>
                  <td className={task.dueClass}>{task.dueDate}</td>
                  <td>
                    <div className="md-assigned-user">
                      <img src={task.userImage} alt={task.userName} />
                      {task.userName}
                    </div>
                  </td>
                  <td>
                    <span className={`md-status-btn ${task.statusClass}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default UpcomingDueDates;
