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
    'medium',
    'low',
    'Pause',
    'Block',
    'Done',
];

const ProfileUpdateSection = () => {
    const [designation, setDesignation] = useState('Senior Developer');
    const [status, setStatus] = useState('Active');
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = (type) => {
        setOpenDropdown((prev) => (prev === type ? null : type));
    };

    const handleSelect = (type, value) => {
        if (type === 'designation') setDesignation(value);
        if (type === 'status') setStatus(value);
        setOpenDropdown(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <section className="pe page3-main2">
            <div className="update-upload-profile">
                <div className="update-your-pro">
                    <div className="upadate-profile-img">
                        <div className="update-img">
                            <img src="/Image/prn1.png" alt="prn1" />
                        </div>
                    </div>
                    <div className="update-profile-detail">
                        <div className="full-name">
                            <span>Full Name</span>
                            <input type="text" />
                        </div>
                        <div className="update-dropdown" ref={dropdownRef}>
                            <div className={`btn_main1 ${openDropdown === 'designation' ? 'open' : ''}`}>
                                <p>Designation</p>
                                <div className="dropdown_toggle1" onClick={() => toggleDropdown('designation')}>
                                    <div className="t-b-inner">
                                        <span className="text_btn1">{designation}</span>
                                        <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon1" />
                                    </div>
                                </div>
                                <ul className="dropdown_menu1">
                                    {dropdownOptions.map((option, idx) => (
                                        <li key={idx} onClick={() => handleSelect('designation', option)}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={`btn_main1 ${openDropdown === 'status' ? 'open' : ''}`}>
                                <p>Status</p>
                                <div className="dropdown_toggle1" onClick={() => toggleDropdown('status')}>
                                    <div className="t-b-inner">
                                        <span className="text_btn1">{status}</span>
                                        <img src="/SVG/header-vector.svg" alt="vec" className="arrow_icon1" />
                                    </div>
                                </div>
                                <ul className="dropdown_menu1">
                                    {dropdownOptions.map((option, idx) => (
                                        <li key={idx} onClick={() => handleSelect('status', option)}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="upload-profile">
                    <div className="upload-img">
                        <a href="#">
                            <img src="/SVG/upload-vec.svg" alt="upload" />
                        </a>
                    </div>
                    <span>Update Profile Picture</span>
                </div>
            </div>
        </section>
    );
};

export default ProfileUpdateSection;

