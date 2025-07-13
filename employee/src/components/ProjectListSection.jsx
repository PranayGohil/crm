import React from "react";

// TODO: Replace with API call
/*
const projectList = [
  {
    title: "Rose Gold Bridal Necklace Set",
    status: "Done",
    dateRange: "12 May 2025 – 20 May 2025",
    progressText: "Completed on time",
    progressIcon: "/SVG/cpd-time.svg",
    progressColor: "#10B981",
    progressPercent: 83,
    statusClass: "",
    people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
  },
  {
    title: "Rose Gold Bridal Necklace Set",
    status: "Done",
    dateRange: "12 May 2025 – 20 May 2025",
    progressText: "Completed on time",
    progressIcon: "/SVG/cpd-time.svg",
    progressColor: "#10B981",
    progressPercent: 83,
    statusClass: "",
    people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
  },
  {
    title: "Rose Gold Bridal Necklace Set",
    status: "Done",
    dateRange: "12 May 2025 – 20 May 2025",
    progressText: "Completed on time",
    progressIcon: "/SVG/cpd-time.svg",
    progressColor: "#10B981",
    progressPercent: 83,
    statusClass: "",
    people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
  },
  {
    title: "Rose Gold Bridal Necklace Set",
    status: "Blocked",
    dateRange: "12 May 2025 – 20 May 2025",
    progressText: "50 days remain",
    progressIcon: "/SVG/cpd-blocked.svg",
    progressColor: "#B91C1C",
    progressPercent: 10,
    statusClass: "cpd-blocked",
    people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
  },
  {
    title: "Rose Gold Bridal Necklace Set",
    status: "In Progress",
    dateRange: "12 May 2025 – 20 May 2025",
    progressText: "8 days remain",
    progressIcon: "/SVG/cpd-in_progress.svg",
    progressColor: "#F59E0B",
    progressPercent: 25,
    statusClass: "cpd-in_progress",
    people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
  },
];
*/

const ProjectListSection = () => {
    const projectList = [
        {
            title: "Rose Gold Bridal Necklace Set",
            status: "Done",
            dateRange: "12 May 2025 – 20 May 2025",
            progressText: "Completed on time",
            progressIcon: "/SVG/cpd-time.svg",
            progressColor: "#10B981",
            progressPercent: 83,
            statusClass: "",
            people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
        },
        {
            title: "Rose Gold Bridal Necklace Set",
            status: "Done",
            dateRange: "12 May 2025 – 20 May 2025",
            progressText: "Completed on time",
            progressIcon: "/SVG/cpd-time.svg",
            progressColor: "#10B981",
            progressPercent: 83,
            statusClass: "",
            people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
        },
        {
            title: "Rose Gold Bridal Necklace Set",
            status: "Done",
            dateRange: "12 May 2025 – 20 May 2025",
            progressText: "Completed on time",
            progressIcon: "/SVG/cpd-time.svg",
            progressColor: "#10B981",
            progressPercent: 83,
            statusClass: "",
            people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
        },
        {
            title: "Rose Gold Bridal Necklace Set",
            status: "Blocked",
            dateRange: "12 May 2025 – 20 May 2025",
            progressText: "50 days remain",
            progressIcon: "/SVG/cpd-blocked.svg",
            progressColor: "#B91C1C",
            progressPercent: 10,
            statusClass: "cpd-blocked",
            people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
        },
        {
            title: "Rose Gold Bridal Necklace Set",
            status: "In Progress",
            dateRange: "12 May 2025 – 20 May 2025",
            progressText: "8 days remain",
            progressIcon: "/SVG/cpd-in_progress.svg",
            progressColor: "#F59E0B",
            progressPercent: 25,
            statusClass: "cpd-in_progress",
            people: ["/Image/prn1.png", "/Image/Riya Sharma.png"],
        },
    ];

    return (
        <section className="cpd-project_jwell main-2">
            {projectList.map((project, index) => (
                <div className="cpd-project_jwell-inner" key={index}>
                    <div className="cpd-inner_heading">
                        <div className="cpd-heading-inn">
                            <h3>{project.title}</h3>
                            <span className={project.statusClass}>{project.status}</span>
                        </div>
                        <div className="cd-joining_date">
                            <img src="/SVG/calender-vec.svg" alt="cal1" />
                            <p>{project.dateRange}</p>
                        </div>
                        <div className="cd-project-content-btn">
                            <div className={`cpd-timeofcom ${project.statusClass}`}>
                                <img src={project.progressIcon} alt="tt" />
                                <span>{project.progressText}</span>
                            </div>
                            <div className="cd-view_link">
                                {/* <a href="#">
                                    Project content
                                    <img src="/SVG/cd-arrow-vec.svg" alt="ar1" />
                                </a> */}
                            </div>
                        </div>
                    </div>
                    <div className="cd-progress_bar">
                        <div className="cd-pr_bar-txt">
                            <p>Subtasks Completed</p>
                            <span style={{ color: project.progressColor }}>
                                {project.progressPercent}%
                            </span>
                        </div>
                        <div className="cd-progress_container">
                            <div
                                className="cd-progress"
                                style={{
                                    width: `${project.progressPercent}%`,
                                    backgroundColor: project.progressColor,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="cpd-client_info">
                        <div className="cpd-client_photo">
                            {project.people.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`cpd-prn${idx + 1} cpd-person`}
                                >
                                    <img src={img} alt={`p${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                        <div className="cpd-info_btn">
                            <a href="ClientSubtaskShow" className="cpd-info cd-info_btn">
                                <img src="/SVG/cpd-info-blue.svg" alt="info" />
                                Subtask
                            </a>
                            {/* <a href="#" className="cpd-sett">
                                <img src="/SVG/3-dots-vec.svg" alt="set" />
                            </a> */}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default ProjectListSection;
