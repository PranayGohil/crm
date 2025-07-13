import { useState, useEffect, useRef } from "react";

const ClientAdminProjectDetails = () => {
  const [status, setStatus] = useState("All Statuses");
  const [stage, setStage] = useState("All Stages");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const dropdownOptions = ["In progress", "To do", "Pause", "Block", "Done"];

  const statusRef = useRef(null);
  const stageRef = useRef(null);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleClickOutside = (e) => {
    if (
      statusRef.current &&
      !statusRef.current.contains(e.target) &&
      stageRef.current &&
      !stageRef.current.contains(e.target)
    ) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    const inProgress = 30;
    const completed = 70;
    const overdue = 20;

    document
      .querySelector(".md-completed")
      ?.style.setProperty("flex", completed);
    document
      .querySelector(".md-in_progress")
      ?.style.setProperty("flex", inProgress);
    document.querySelector(".md-overdue")?.style.setProperty("flex", overdue);
  }, []);

  const projectData = [
    {
      id: 1,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      status: "In Progress",
      statusClass: "md-status-progress",
      progressColor: "cdn-bg-color-yellow",
      dateRange: "12 May 2025 – 20 May 2025",
      daysRemain: 1,
      completed: 60,
      total: 100,
      progress: 65,
      users: [
        "Image/user.jpg",
        "Image/user4.jpg",
        "Image/user2.jpg",
        "Image/user3.jpg",
      ],
    },
    {
      id: 2,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      status: "To do",
      statusClass: "md-status-todo",
      progressColor: "cdn-bg-color-blue",
      dateRange: "12 May 2025 – 20 May 2025",
      daysRemain: 1,
      completed: 60,
      total: 100,
      progress: 65,
      users: [
        "Image/user.jpg",
        "Image/user4.jpg",
        "Image/user3.jpg",
        "Image/user2.jpg",
      ],
    },
    {
      id: 3,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      status: "Done",
      statusClass: "md-status-completed",
      progressColor: "cdn-bg-color-green",
      dateRange: "12 May 2025 – 20 May 2025",
      daysRemain: 1,
      completed: 60,
      total: 100,
      progress: 65,
      users: [
        "Image/user3.jpg",
        "Image/user4.jpg",
        "Image/user2.jpg",
        "Image/user.jpg",
      ],
    },
    {
      id: 4,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      status: "Blocked",
      statusClass: "md-status-blocked",
      progressColor: "cdn-bg-color-red",
      dateRange: "12 May 2025 – 20 May 2025",
      daysRemain: 1,
      completed: 60,
      total: 100,
      progress: 65,
      users: [
        "Image/user.jpg",
        "Image/user.jpg",
        "Image/user.jpg",
        "Image/user.jpg",
      ],
    },
    {
      id: 5,
      title: "Modern Villa Design",
      client: "Sharma Enterprises",
      status: "In Review",
      statusClass: "md-status-review",
      progressColor: "cdn-bg-color-purple",
      dateRange: "12 May 2025 – 20 May 2025",
      daysRemain: 1,
      completed: 60,
      total: 100,
      progress: 65,
      users: [
        "Image/user.jpg",
        "Image/user2.jpg",
        "Image/user3.jpg",
        "Image/user4.jpg",
      ],
    },
  ];

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const summaryData = [
    { icon: "/SVG/cpd-join.svg", label: "Joined", value: "12 March 2024" },
    { icon: "/SVG/cpd-total.svg", label: "Total Projects", value: 5 },
    { icon: "/SVG/cpd-complete.svg", label: "Completed", value: 2 },
    { icon: "/SVG/cpd-process.svg", label: "In Progress", value: 3 },
  ];

  return (
    <div className="project_client__client-main mb_40">
      <section className="cd-client_dashboard header">
        <div className="cd-head-menu head-menu cpd_header">
          {/* <a href=""><img alt="" className="back_arrow" src="/SVG/arrow-pc.svg" /></a> */}
          <h1>Client: Amara Jewels</h1>
        </div>
        <div className="cd-nav-bar nav-bar">
          <div className="cd-nav-search nav-search">
            <div className="cd-searchbar searchbar">
              <div className="cd-input-type input-type">
                <div className="cd-img-search-input img-search-input">
                  <img src="/SVG/search-icon.svg" alt="search" />
                </div>
                <div className="cd-input-type-txt input-type-txt">
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            </div>
            {/* <div className="cd-add-mbr add-mbr">
                        <div className="cd-client_dashboard plus-icon">
                            <a href="AddNewProject"><img src="/SVG/plus.svg" alt="search" /><span>Add Project</span></a>
                        </div>
                    </div> */}
          </div>
        </div>
      </section>
      <section className="cpd-main_section">
        <div className="cpd-main_inner">
          {summaryData.map((item, index) => (
            <div key={index} className={`cpd-head-inner inf-sec-${index + 1}`}>
              <img src={item.icon} alt={item.label} />
              <div className="cpd-name name1">
                <p>{item.label}</p>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="cd-filters-inner cpd-filters_inner">
          <div className="cpd-menu-bar">
            {/* Status Dropdown */}
            <div
              className={`btn_main ${
                activeDropdown === "status" ? "open" : ""
              }`}
              ref={statusRef}
            >
              <div
                className="dropdown_toggle"
                onClick={() => toggleDropdown("status")}
              >
                <span className="text_btn">{status}</span>
                <img
                  src="/SVG/header-vector.svg"
                  alt="arrow"
                  className="arrow_icon"
                />
              </div>
              <ul className="dropdown_menu">
                {dropdownOptions.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setStatus(option);
                      setActiveDropdown(null);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stage Dropdown */}
            {/* <div className={`btn_main ${activeDropdown === "stage" ? "open" : ""}`} ref={stageRef}>
                        <div className="dropdown_toggle" onClick={() => toggleDropdown("stage")}>
                            <span className="text_btn">{stage}</span>
                            <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
                        </div>
                        <ul className="dropdown_menu">
                            {dropdownOptions.map((option, index) => (
                                <li key={index} onClick={() => {
                                    setStage(option);
                                    setActiveDropdown(null);
                                }}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div> */}
          </div>

          <div className="filter cpd_filter_header">
            <img src="/SVG/filter-vector.svg" alt="filter" />
            <span>Reset Filters</span>
          </div>
        </div>
      </section>
      <section
        className="md-recent-main-project-main"
        id="ap-recent-main-project-main"
      >
        <div
          className="md-recent-main-project-main-inner ap-recent-main-project-main-inner"
          id="ap-recent-main-project-main-inner"
        >
          <div className="md-recent-project-card">
            {projectData.map((project, idx) => (
              <div className="md-project_card" key={idx}>
                <div
                  className={`md-project_card__header_border ${project.progressColor}`}
                ></div>
                <div className="md-project_card__content">
                  <div className="md-project_card__top_row">
                    <h3 className="md-project_card__title">{project.title}</h3>
                    <span className={`md-status-btn ${project.statusClass}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="md-project_card__subtitle">
                    <p>{project.client}</p>
                    <div className="md-due-date-main">
                      <img src="SVG/time-due.svg" alt="due icon" />
                      <span>
                        <span>{project.daysRemain}</span> day remain
                      </span>
                    </div>
                  </div>

                  <div className="md-project_card__date_row">
                    <div className="md-project_card__date">
                      <img src="SVG/calendar.svg" alt="calendar" />
                      <span>{project.dateRange}</span>
                    </div>
                  </div>

                  <div className="md-project-card__subtask_text">
                    <div className="md-subtask-text">Subtasks Completed</div>
                    <div className="md-subtask-total-sub_number">
                      {project.completed}/{project.total}
                    </div>
                  </div>

                  <div className="md-project_card__progress_bar">
                    <div
                      className={`md-project_card__progress_fill ${project.progressColor}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="md-project_card__footer_row">
                    <div className="md-project_card__avatars">
                      <div className="md-user_avatars-img">
                        {project.users.map((user, i) => (
                          <img src={user} alt={`User ${i + 1}`} key={i} />
                        ))}
                      </div>
                    </div>
                    <span className="md-project_card__tasks_completed">
                      Active Staff: 4
                    </span>
                  </div>

                  <div className="md-project_card__button_wrap">
                    <a
                      href="ClientAdminSubtaskShow"
                      className="md-project_card__view_btn"
                    >
                      View Subtask
                    </a>
                    <a
                      href="ClientAdminProjectContent"
                      className="md-project_card__view_btn"
                    >
                      View Content
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientAdminProjectDetails;
