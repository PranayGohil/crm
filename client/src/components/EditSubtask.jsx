import React, { useState, useEffect } from "react";

const dropdownOptionsMap = {
    assignTo: ["emp1", "emp2", "emp3", "emp4", "emp5"],
    priority: ["Low", "Medium", "High"],
    stage: ["Design", "Render"]
};

const EditSubtask = () => {
    const [dropdowns, setDropdowns] = useState({
        assignTo: "Select user...",
        priority: "Select priority...",
        stage: "Select stage..."
    });

    const [openDropdowns, setOpenDropdowns] = useState({
        assignTo: false,
        priority: false,
        stage: false
    });

    const handleDropdown = (key, value) => {
        setDropdowns(prev => ({ ...prev, [key]: value }));
        setOpenDropdowns(prev => ({ ...prev, [key]: false }));
    };

    const handleToggle = (key) => {
        setOpenDropdowns(prev => ({
            ...Object.fromEntries(Object.keys(prev).map(k => [k, false])),
            [key]: !prev[key]
        }));
    };

    useEffect(() => {
        const closeDropdowns = () => {
            setOpenDropdowns({
                assignTo: false,
                priority: false,
                stage: false
            });
        };
        document.addEventListener("click", closeDropdowns);
        return () => document.removeEventListener("click", closeDropdowns);
    }, []);

    return (
        <section className="sm-add-task sms-add_and_generator mg-auto">
            <div className="sm-add-task-inner sms-add_and_generatoe_inner">
                <div className="sm-add-gen-task sms-add_new-task sms-add_gen-task">
                    <div className="sms-add_task-inner">
                        <div className="sms-add_task-heading">
                            <h2>Edit Subtask</h2>
                        </div>
                        <div className="add-sub_task_main add-add_gen_main">

                            {/* Subtask Name */}
                            <div className="sms-add_task-form">
                                <div className="sms-add_name sms-add_same">
                                    <span>Subtask Name</span>
                                    <input type="text" placeholder="Subtask Name" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="sms-add_task-form">
                                <div className="sms-add_des sms-add_same">
                                    <span>Description</span>
                                    <input type="text" placeholder="Brief description of the task" />
                                </div>
                            </div>

                            {/* Path to file */}
                            <div className="sms-add_task-form">
                                <div className="sms-add_name sms-add_same">
                                    <span>Path to file (Optional)</span>
                                    <input type="text" placeholder="e.g., Dropbox/Google Drive/File Path" />
                                </div>
                            </div>

                            {/* Dropdowns */}
                            {["assignTo", "priority", "stage"].map((key) => (
                                <div className="sms-add_path sms-add_same" key={key}>
                                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                    <div
                                        className="sms-dropdown_toggle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggle(key);
                                        }}
                                    >
                                        <span className="sms-text_btn">{dropdowns[key]}</span>
                                        <img src="/SVG/header-vector.svg" alt="vec" className="sms-arrow_icon" />
                                    </div>
                                    <ul className={`sms-dropdown_menu ${openDropdowns[key] ? "open" : ""}`}>
                                        {dropdownOptionsMap[key].map((item, i) => (
                                            <li key={i} onClick={(e) => {
                                                e.stopPropagation();
                                                handleDropdown(key, item);
                                            }}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Attach Files */}
                            <div className="sms-attach_files sms-add_same">
                                <span>Content Included</span>
                                <div className="epc-drag-drop-files">
                                    <img src="/SVG/drag-drop-vec.svg" alt="drag" />
                                    <a href="#" className="browse-file">Drag and drop files here or click to browse</a>
                                    <span>JPG, PNG, PDF (Max 5MB)</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="sms-final_btns">
                                <div className="sms-reset-btn">
                                    <a href="#">Reset Form</a>
                                </div>
                                <div className="sms-save-btn">
                                    <a href="#">Save Subtask</a>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditSubtask;
