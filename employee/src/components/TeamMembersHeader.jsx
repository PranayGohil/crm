import React, { useState, useEffect, useRef } from 'react';

// const departments = ['In progress', 'To do', 'Pause', 'Block', 'Done'];
// const roles = ['In progress', 'To do', 'Pause', 'Block', 'Done'];
// const statuses = ['In progress', 'To do', 'Pause', 'Block', 'Done'];
// TODO: Replace with API call

const dropdownData = {
    departments: ['In progress', 'To do', 'Pause', 'Block', 'Done'],
    roles: ['In progress', 'To do', 'Pause', 'Block', 'Done'],
    statuses: ['In progress', 'To do', 'Pause', 'Block', 'Done'],
};

const Dropdown = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(label);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = e => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className={`btn_main ${isOpen ? 'open' : ''}`} ref={ref}>
            <div className="dropdown_toggle header-dropdown-width" onClick={() => setIsOpen(prev => !prev)}>
                <span className="text_btn">{selected}</span>
                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon" />
            </div>
            {isOpen && (
                <ul className="dropdown_menu">
                    {options.map((item, index) => (
                        <li key={index} onClick={() => { setSelected(item); setIsOpen(false); }}>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const TeamMembersHeader = () => {
    return (
        <section className="header">
            <div className="head-menu">
                <h1>Team Members</h1>
                <div className="nav-bar">
                    <div className="nav-search">
                        <div className="searchbar">
                            <div className="input-type">
                                <div className="img-search-input">
                                    <img src="/SVG/search-icon.svg" alt="search" />
                                </div>
                                <div className="input-type-txt">
                                    <input type="text" placeholder="Search by name, email..." style={{ border: 'none' }} />
                                </div>
                            </div>
                        </div>
                        <div className="add-mbr">
                            <div className="plus-icon">
                                <a href="CreateEmployeeProfile"><img src="/SVG/plus.svg" alt="add" /><span>Add Member</span></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tm-menubar">
                <div className="menu-bar">
                    <Dropdown label="All Departments" options={dropdownData.departments} />
                    <Dropdown label="All Roles" options={dropdownData.roles} />
                    <Dropdown label="All Status" options={dropdownData.statuses} />
                </div>
                <div className="tm-filter filter">
                    <a href="#"><img src="/SVG/filter-vector.svg" alt="reset" /><span>Reset Filters</span></a>
                </div>
            </div>
        </section>
    );
};

export default TeamMembersHeader;


