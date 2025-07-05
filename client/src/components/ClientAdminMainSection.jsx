import React, { useState, useEffect, useRef } from "react";

// TODO: Replace with API call
const summaryData = [
    { icon: "/SVG/cpd-join.svg", label: "Joined", value: "12 March 2024" },
    { icon: "/SVG/cpd-total.svg", label: "Total Projects", value: 5 },
    { icon: "/SVG/cpd-complete.svg", label: "Completed", value: 2 },
    { icon: "/SVG/cpd-process.svg", label: "In Progress", value: 3 }
];

const dropdownOptions = ["In progress", "To do", "Pause", "Block", "Done"];

const ClientAdminMainSection = () => {
    const [status, setStatus] = useState("All Statuses");
    const [stage, setStage] = useState("All Stages");
    const [activeDropdown, setActiveDropdown] = useState(null);

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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
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
                    <div className={`btn_main ${activeDropdown === "status" ? "open" : ""}`} ref={statusRef}>
                        <div className="dropdown_toggle" onClick={() => toggleDropdown("status")}>
                            <span className="text_btn">{status}</span>
                            <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
                        </div>
                        <ul className="dropdown_menu">
                            {dropdownOptions.map((option, index) => (
                                <li key={index} onClick={() => {
                                    setStatus(option);
                                    setActiveDropdown(null);
                                }}>
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
    );
};

export default ClientAdminMainSection;
