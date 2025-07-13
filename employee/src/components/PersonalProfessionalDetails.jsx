import React, { useState, useEffect, useRef } from 'react';

// TODO: Replace with API call
/*
const dropdownOptions = [
  'In progress',
  'To do',
  'Pause',
  'Block',
  'Done',
];
*/

const dropdownOptions = [
    'In progress',
    'To do',
    'Pause',
    'Block',
    'Done',
];

const employmentTypes = ['Full-time', 'Part-time'];
const defaultManager = 'Sarah Johnson (CTO)';

const PersonalProfessionalDetails = () => {
    const [dropdowns, setDropdowns] = useState({
        department: 'Engineering',
        designation: 'Senior Developer',
        employmentType: employmentTypes[0],
        reportingManager: defaultManager,
    });

    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = (type) => {
        setOpenDropdown((prev) => (prev === type ? null : type));
    };

    const handleSelect = (type, value) => {
        setDropdowns((prev) => ({ ...prev, [type]: value }));
        setOpenDropdown(null);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <section className="personal-proffesional">
            <div className="profile-edit-header mem-personal-detail">
                <div className="profile-heading">
                    <div className="profile-edit-heading personal-detail">
                        <span>Personal Details</span>
                    </div>
                </div>
                <div className="profile-inner">
                    <div className="profile-edit-inner phone-num">
                        <div className="profile-edit-detail phone-num-txt">
                            <span>Phone Number</span>
                            <input type="number" placeholder="+91 9876543210" />
                        </div>
                    </div>
                    <div className="profile-edit-inner email">
                        <div className="profile-edit-detail mail-txt">
                            <span>Email Address</span>
                            <input type="email" placeholder="riya.sharma@email.com" />
                        </div>
                    </div>
                    <div className="profile-edit-inner home-add">
                        <div className="profile-edit-detail phone-num-txt">
                            <span>Home Address</span>
                            <input type="text" placeholder="123 Rose Villa, Sector 45, Jaipur" />
                        </div>
                    </div>
                    <div className="profile-edit-inner date-of-birth">
                        <div className="profile-edit-detail date-birth-txt">
                            <span>Date of Birth</span>
                            <input type="date" />
                        </div>
                    </div>
                    <div className="profile-edit-inner egn-contact">
                        <div className="profile-edit-detail eng-cnt-txt">
                            <span>Emergency Contact</span>
                            <input type="text" placeholder="+91 9012345678 (Father)" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-edit-header mem-professional-detail" ref={dropdownRef}>
                <div className="profile-heading">
                    <div className="profile-edit-heading personal-detail">
                        <span>Professional Details</span>
                    </div>
                </div>
                <div className="profile-inner">
                    <div className="profile-edit-inner emp-id">
                        <div className="profile-edit-detail phone-num-txt">
                            <span>Employee ID</span>
                            <input type="text" placeholder="EMP2341" />
                        </div>
                    </div>

                    {[
                        { label: 'Department', type: 'department' },
                        { label: 'Designation', type: 'designation' },
                        { label: 'Reporting Manager', type: 'reportingManager' },
                    ].map(({ label, type }) => (
                        <div className={`profile-edit-inner emp-${type}`} key={type}>
                            <div className="Department emp-detail mail-txt">
                                <p>{label}</p>
                                <div className="dropdown_toggle2" onClick={() => toggleDropdown(type)}>
                                    <span className="text_btn2">{dropdowns[type]}</span>
                                    <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon2" />
                                </div>
                                <ul className="dropdown_menu2">
                                    {dropdownOptions.map((option, idx) => (
                                        <li key={idx} onClick={() => handleSelect(type, option)}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}

                    <div className="profile-edit-inner emp-doj">
                        <div className="profile-edit-detail eng-cnt-txt">
                            <span>Date of Joining</span>
                            <input type="date" />
                        </div>
                    </div>

                    <div className="profile-edit-inner emp-salary">
                        <div className="profile-edit-detail eng-cnt-txt">
                            <span>Monthly Salary</span>
                            <input type="number" placeholder="75,000" />
                        </div>
                    </div>

                    <div className="profile-edit-inner emp-type">
                        <div className="Department emp-detail mail-txt">
                            <p>Employment Type</p>
                            <div className="dropdown_toggle2" onClick={() => toggleDropdown('employmentType')}>
                                <span className="text_btn2">{dropdowns.employmentType}</span>
                                <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon2" />
                            </div>
                            <ul className="dropdown_menu2">
                                {employmentTypes.map((type, idx) => (
                                    <li key={idx} onClick={() => handleSelect('employmentType', type)}>
                                        {type}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PersonalProfessionalDetails;

