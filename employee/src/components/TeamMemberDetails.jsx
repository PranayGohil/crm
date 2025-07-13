import React from 'react';

// TODO: Replace with API call
// const personalDetails = [...];
// const professionalDetails = [...];

const TeamMemberDetails = () => {
    const personalDetails = [
        {
            icon: '/SVG/phone-vec.svg',
            label: 'Phone Number',
            value: '+91 9876543210',
        },
        {
            icon: '/SVG/mail.vec.svg',
            label: 'Email Address',
            value: 'riya.sharma@email.com',
        },
        {
            icon: '/SVG/home-vec.svg',
            label: 'Home Address',
            value: '123 Rose Villa, Sector 45, Jaipur',
        },
        {
            icon: '/SVG/birth-vec.svg',
            label: 'Date of Birth',
            value: '24 July 1995',
        },
        {
            icon: '/SVG/call-vec.svg',
            label: 'Emergency Contact',
            value: '+91 9012345678 (Father)',
        },
    ];

    const professionalDetails = [
        {
            icon: '/SVG/emp-id.svg',
            label: 'Employee ID',
            value: 'EMP2341',
        },
        {
            icon: '/SVG/dep-vec.svg',
            label: 'Department',
            value: 'Design',
        },
        {
            icon: '/SVG/cad-vec.svg',
            label: 'Designation',
            value: 'CAD Designer',
        },
        {
            icon: '/SVG/doj-vec.svg',
            label: 'Date of Joining',
            value: '12 March 2021',
        },
        {
            icon: '/SVG/salary-vec.svg',
            label: 'Monthly Salary',
            value: '₹75,000',
        },
        {
            icon: '/SVG/emp-typr-vec.svg',
            label: 'Employment Type',
            value: 'Full-time',
        },
        {
            icon: '/SVG/man-vec.svg',
            label: 'Reporting Manager',
            value: 'Kunal Mehta',
        },
    ];

    return (
        <section className="tmp-page2 tmp-main-inner">
            <div className="page2-main3">
                <div className="emp-detail-header mem-personal-detail">
                    <div className="main-heading personal-detail">
                        <img src="/SVG/prn-vec.svg" alt="prn" />
                        <span>Personal Details</span>
                    </div>
                    {personalDetails.map((item, index) => (
                        <div className="emp-detail-inner" key={index}>
                            <img src={item.icon} alt={item.label} />
                            <div className="emp-detail">
                                <span>{item.label}</span>
                                <p>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="emp-detail-header mem-professional-detail">
                    <div className="main-heading personal-detail">
                        <img src="/SVG/pro-vc.svg" alt="prn" />
                        <span>Professional Details</span>
                    </div>
                    {professionalDetails.map((item, index) => (
                        <div className="emp-detail-inner" key={index}>
                            <img src={item.icon} alt={item.label} />
                            <div className="emp-detail">
                                <span>{item.label}</span>
                                <p>{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="tmp-login-last">
                <div className="tmp-login-security login-security">
                    <div className="login-img">
                        <img src="/SVG/login-vec.svg" alt="prn" />
                        <span>Login & Security Settings</span>
                    </div>
                    <div className="enter-field">
                        <div className="enter-pass">
                            <span>Username</span>
                            <input type="text" />
                        </div>
                        <div className="enter-pass">
                            <span>Current Password</span>
                            <input type="text" />
                        </div>
                    </div>
                </div>
                <div className="tmp-50"></div>
            </div>
        </section>
    );
};

export default TeamMemberDetails;
