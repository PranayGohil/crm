import React, { useState, useEffect, useRef } from "react";

const EditProjectForm = () => {
    const [selectedClient, setSelectedClient] = useState("Globex Industries");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [priority, setPriority] = useState("medium"); // Set default priority
    const dropdownRef = useRef();

    // TODO: Replace with API call to fetch existing project data
    const clients = ["In progress", "To do", "Pause", "Block", "Done"];

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <section className="anp-add_new_project_form">
            <div className="anp-add_project_inner">
                <div className="anp-project_fields">
                    <div className="anp-prj_name sms-add_same">
                        <span>Project Name</span>
                        <input
                            type="text"
                            placeholder="Enter Project Name (e.g., Classic Gold Bangle)"
                            defaultValue="Classic Gold Bangle" // Pre-filled for editing
                        />
                    </div>
                </div>
                <div className="anp-client_pro_date">
                    <div className="anp-client-name btn_main" ref={dropdownRef}>
                        <span className="anp-client-name-para">Client Name</span>
                        <div className="anp-dropdown_toggle dropdown_toggle" onClick={toggleDropdown}>
                            <span className="text_btn">{selectedClient}</span>
                            <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
                        </div>
                        {dropdownOpen && (
                            <ul className="anp-dropdown_menu dropdown_menu">
                                {clients.map((client, idx) => (
                                    <li key={idx} onClick={() => handleClientSelect(client)}>
                                        {client}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <a href="createnewclient" className="anp-add_client_btn">
                            <img src="/SVG/plus-vec.svg" alt="plus" />
                            Add New Client
                        </a>
                    </div>
                    <div className="anp-start_end-date sms-add_same">
                        <div className="anp-start_date sms-add_same">
                            <span>Start Date - End Date</span>
                            <div className="enp-date_input sms-add_same">
                                <input type="date" defaultValue="2024-01-01" />
                                <input type="date" defaultValue="2024-03-01" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="anp-client_priority sms-add_same">
                    <span>Priority</span>
                    <div className="anp-priority_btn">
                        <div
                            className={`anp-high_btn pr_btn ${priority === "high" ? "active" : ""}`}
                            onClick={() => setPriority("high")}
                        >
                            <img src="/SVG/high-vec.svg" alt="p1" />
                            High
                        </div>
                        <div
                            className={`anp-mid_btn pr_btn ${priority === "medium" ? "active" : ""}`}
                            onClick={() => setPriority("medium")}
                        >
                            <img src="/SVG/mid-vec.svg" alt="p2" />
                            Medium
                        </div>
                        <div
                            className={`anp-low_btn pr_btn ${priority === "low" ? "active" : ""}`}
                            onClick={() => setPriority("low")}
                        >
                            <img src="/SVG/low-vec.svg" alt="p3" />
                            Low
                        </div>
                    </div>
                </div>
                <div className="anp-create_btn">
                    <a href="#" className="anp-create_task-btn">
                        <img src="/SVG/plus.svg" alt="pplus" />
                        Edit Subtasks
                    </a>
                </div>
            </div>
        </section>
    );
};

export default EditProjectForm;
