import React, { useState, useRef, useEffect } from 'react';

const TaskBoardBulkActions = () => {
    const [selectedCount, setSelectedCount] = useState(3);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selections, setSelections] = useState({
        assignTo: 'Assign To',
        priority: 'Set Priority',
        stage: 'Change Stage',
    });

    const dropdownRef = useRef(null);

    const handleOutsideClick = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpenDropdown(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const handleDropdownToggle = (key) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const handleSelect = (key, value) => {
        setSelections(prev => ({ ...prev, [key]: value }));
        setOpenDropdown(null);
    };

    const renderDropdown = (key, items) => (
        openDropdown === key && (
            <ul className="dropdown_menu css-drop-menu1">
                {items.map((item, idx) => (
                    <li key={idx} onClick={() => handleSelect(key, item)}>{item}</li>
                ))}
            </ul>
        )
    );

    return (
        <section className="sv-sec1">
            <div className="sv-last-sec css-sec-last">
                <div className="sv-last-sec-inner css-sec-last-inner">
                    <p><span>{selectedCount}</span> items selected</p>
                    <div className="css-select_all"><a href="#">Select All</a></div>
                    <div className="css-clear_all"><a href="#">Clear Selection</a></div>
                </div>

                <div className="cpd-filters_inner" ref={dropdownRef}>
                    <div className="cpd-menu-bar">
                        {/* Assign To Dropdown */}
                        <div className={`btn_main ${openDropdown === 'assignTo' ? 'open' : ''}`}>
                            <div className="dropdown_toggle" onClick={() => handleDropdownToggle('assignTo')}>
                                <span className="text_btn">{selections.assignTo}</span>
                                <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
                            </div>
                            {renderDropdown('assignTo', ['Ankit Bhatt', 'Riya Sharma', 'Vikram Singh'])}
                        </div>

                        {/* Set Priority Dropdown */}
                        <div className={`btn_main ${openDropdown === 'priority' ? 'open' : ''}`}>
                            <div className="dropdown_toggle" onClick={() => handleDropdownToggle('priority')}>
                                <span className="text_btn">{selections.priority}</span>
                                <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
                            </div>
                            {renderDropdown('priority', ['High', 'Medium', 'Low'])}
                        </div>

                        {/* Change Stage Dropdown */}
                        <div className={`btn_main ${openDropdown === 'stage' ? 'open' : ''}`}>
                            <div className="dropdown_toggle" onClick={() => handleDropdownToggle('stage')}>
                                <span className="text_btn">{selections.stage}</span>
                                <img src="/SVG/header-vector.svg" alt="arrow" className="arrow_icon" />
                            </div>
                            {renderDropdown('stage', ['Render', 'Stone', 'Cad-design'])}
                        </div>

                        {/* Delete Button */}
                        <div className="css-delete_btn">
                            <a href="#" className="css-high css-delete">
                                <img src="/SVG/delete-vec.svg" alt="del" /> Delete Selected
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TaskBoardBulkActions;
